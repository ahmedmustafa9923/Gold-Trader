const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// ─── In-memory trade store (use PostgreSQL in production) ───
let trades = [
  { id: 1, side: 'buy',  qty: 0.5, entry: 3298.40, sl: 3260, tp: 3380, open: true,  openedAt: '2026-04-07T09:15:00Z', pnl: 0 },
  { id: 2, side: 'sell', qty: 0.2, entry: 3380.00, sl: 3420, tp: 3300, open: true,  openedAt: '2026-04-07T11:30:00Z', pnl: 0 },
  { id: 3, side: 'buy',  qty: 1.0, entry: 3210.00, sl: 3180, tp: 3300, open: false, openedAt: '2026-04-04T08:00:00Z', closedAt: '2026-04-05T14:00:00Z', closePrice: 3296.00, pnl: 86.00 },
  { id: 4, side: 'buy',  qty: 0.3, entry: 3150.00, sl: 3120, tp: 3240, open: false, openedAt: '2026-04-02T09:00:00Z', closedAt: '2026-04-03T12:00:00Z', closePrice: 3188.00, pnl: 11.40 },
  { id: 5, side: 'sell', qty: 0.5, entry: 3310.00, sl: 3340, tp: 3250, open: false, openedAt: '2026-03-31T10:00:00Z', closedAt: '2026-04-01T15:00:00Z', closePrice: 3340.00, pnl: -15.00 },
];
let nextId = 6;
let portfolio = { balance: 48290.60, equity: 48290.60 };

// ─── Simulated real-time price (replace with real API key) ───
let currentPrice = 3342.80;
let priceHistory = [];

function generateCandles(count = 50) {
  const candles = [];
  let price = 3200;
  const now = Date.now();
  for (let i = count; i >= 0; i--) {
    const open = price;
    const change = (Math.random() - 0.47) * 18;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 12;
    const low  = Math.min(open, close) - Math.random() * 12;
    const vol  = Math.floor(Math.random() * 5000 + 1000);
    candles.push({
      time: new Date(now - i * 15 * 60 * 1000).toISOString(),
      open: +open.toFixed(2), high: +high.toFixed(2),
      low: +low.toFixed(2),   close: +close.toFixed(2), vol
    });
    price = close;
  }
  currentPrice = +price.toFixed(2);
  return candles;
}

priceHistory = generateCandles(50);

// Tick price every 2s
setInterval(() => {
  const delta = (Math.random() - 0.48) * 1.2;
  currentPrice = +(currentPrice + delta).toFixed(2);
  // Update open trade P&L
  trades.forEach(t => {
    if (!t.open) return;
    if (t.side === 'buy')  t.pnl = +((currentPrice - t.entry) * t.qty).toFixed(2);
    if (t.side === 'sell') t.pnl = +((t.entry - currentPrice) * t.qty).toFixed(2);
  });
  // Append new tick to last candle or create new one
  const last = priceHistory[priceHistory.length - 1];
  last.close = currentPrice;
  last.high = Math.max(last.high, currentPrice);
  last.low  = Math.min(last.low, currentPrice);
}, 2000);

// ─── Routes ───
app.get('/api/price', (req, res) => {
  const openPnl = trades.filter(t => t.open).reduce((s, t) => s + t.pnl, 0);
  res.json({
    price: currentPrice,
    change: +(currentPrice - 3324.40).toFixed(2),
    changePct: +(((currentPrice - 3324.40) / 3324.40) * 100).toFixed(3),
    high: Math.max(...priceHistory.slice(-8).map(c => c.high)),
    low:  Math.min(...priceHistory.slice(-8).map(c => c.low)),
    openPnl: +openPnl.toFixed(2),
    portfolio: { ...portfolio, equity: +(portfolio.balance + openPnl).toFixed(2) }
  });
});

app.get('/api/candles', (req, res) => res.json(priceHistory));

app.get('/api/trades', (req, res) => {
  const withPnl = trades.map(t => {
    if (t.open) {
      const pnl = t.side === 'buy'
        ? (currentPrice - t.entry) * t.qty
        : (t.entry - currentPrice) * t.qty;
      return { ...t, pnl: +pnl.toFixed(2), currentPrice };
    }
    return t;
  });
  res.json(withPnl);
});

app.post('/api/trades', (req, res) => {
  const { side, qty, sl, tp } = req.body;
  if (!side || !qty) return res.status(400).json({ error: 'side and qty required' });
  const trade = {
    id: nextId++, side, qty: +qty, entry: currentPrice,
    sl: +sl || 0, tp: +tp || 0, open: true,
    openedAt: new Date().toISOString(), pnl: 0
  };
  trades.push(trade);
  res.json({ success: true, trade });
});

app.post('/api/trades/:id/close', (req, res) => {
  const trade = trades.find(t => t.id === +req.params.id && t.open);
  if (!trade) return res.status(404).json({ error: 'Trade not found' });
  trade.open = false;
  trade.closedAt = new Date().toISOString();
  trade.closePrice = currentPrice;
  trade.pnl = trade.side === 'buy'
    ? +((currentPrice - trade.entry) * trade.qty).toFixed(2)
    : +((trade.entry - currentPrice) * trade.qty).toFixed(2);
  portfolio.balance = +(portfolio.balance + trade.pnl).toFixed(2);
  res.json({ success: true, trade });
});

app.post('/api/deposit', (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
  portfolio.balance = +(portfolio.balance + +amount).toFixed(2);
  res.json({ success: true, balance: portfolio.balance });
});

// ─── AI Signal endpoint using Claude API ───
app.post('/api/ai/signal', async (req, res) => {
  const { question } = req.body;
  const openTrades = trades.filter(t => t.open);
  const recentCandles = priceHistory.slice(-10);
  const rsi = 58 + Math.random() * 10;
  const macd = currentPrice > 3330 ? 'bullish crossover' : 'bearish pressure';

  const systemPrompt = `You are a professional gold (XAU/USD) trading analyst AI embedded in a trading dashboard.
Be concise, direct, and actionable. Always include: market assessment, key levels, and a clear recommendation.
Never give generic advice — always reference the actual current price and positions provided.
Format: 2-3 short paragraphs max. Use plain language a day trader can act on immediately.`;

  const userPrompt = question
    ? `The trader asks: "${question}"
Current XAU/USD price: $${currentPrice}
Open positions: ${JSON.stringify(openTrades)}
Recent 10 candles (OHLCV): ${JSON.stringify(recentCandles.map(c => ({ o: c.open, h: c.high, l: c.low, c: c.close })))}
RSI(14): ${rsi.toFixed(1)}, MACD: ${macd}
Answer their specific question with reference to actual data.`
    : `Analyse the current gold market and give a trading signal.
Current XAU/USD: $${currentPrice}
Open positions: ${JSON.stringify(openTrades)}
RSI(14): ${rsi.toFixed(1)}, MACD signal: ${macd}
Recent closes: ${recentCandles.slice(-5).map(c => c.close).join(', ')}
Provide: 1) Market outlook 2) Key support/resistance levels 3) Clear recommendation (buy/sell/hold/exit)`;

  try {
    const key = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      // Demo fallback when no key is set
      return res.json({
        signal: currentPrice > 3330 ? 'BUY' : 'HOLD',
        message: `Gold is trading at $${currentPrice}, showing ${currentPrice > 3340 ? 'strong bullish' : 'neutral'} momentum. RSI at ${rsi.toFixed(0)} indicates ${rsi > 65 ? 'approaching overbought — consider tightening stops' : 'room to continue upward'}. Key support at $3,300 and resistance at $3,380. ${currentPrice > 3330 ? 'Bias remains bullish above $3,310 — hold longs and look to add on dips.' : 'Wait for a clear break above $3,340 before adding positions.'}`,
        rsi: +rsi.toFixed(1), macd, price: currentPrice,
        demo: true
      });
    }

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    }, {
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    });

    const text = response.data.content[0].text;
    const signal = text.toLowerCase().includes('buy') ? 'BUY'
      : text.toLowerCase().includes('sell') ? 'SELL'
      : text.toLowerCase().includes('exit') ? 'EXIT' : 'HOLD';

    res.json({ signal, message: text, rsi: +rsi.toFixed(1), macd, price: currentPrice });
  } catch (err) {
    console.error('Claude API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'AI signal unavailable', detail: err.message });
  }
});

// Catch-all — serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Gold trading app running on port ${PORT}`));
