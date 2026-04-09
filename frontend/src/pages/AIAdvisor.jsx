import { useState, useRef, useEffect } from 'react'

const QUICK = [
  'Should I buy or sell gold right now?',
  'What are the key support and resistance levels?',
  'Is this a good time to close my positions?',
  'What does the RSI tell me about current momentum?',
  'How much risk am I taking with my open positions?',
]

function Message({ m }) {
  const isAI = m.role === 'ai'
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 20, animation: 'fadeIn 0.3s ease' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: isAI ? 'linear-gradient(135deg, #8B6310, #E8B84B)' : 'var(--bg4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: isAI ? 14 : 12, color: isAI ? '#fff' : 'var(--text2)', marginTop: 2,
        fontFamily: 'var(--font-display)'
      }}>{isAI ? 'Au' : 'JD'}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>
          {isAI ? 'Aurum AI · Gold Analyst' : 'You'} · {m.time}
        </div>
        {m.signal && (
          <div style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 20, marginBottom: 8, fontSize: 12, fontWeight: 600,
            background: m.signal === 'BUY' ? 'var(--green-bg)' : m.signal === 'SELL' ? 'var(--red-bg)' : 'rgba(201,146,42,0.15)',
            color: m.signal === 'BUY' ? 'var(--green)' : m.signal === 'SELL' ? 'var(--red)' : 'var(--gold-light)',
            border: `1px solid ${m.signal === 'BUY' ? 'rgba(46,204,113,0.3)' : m.signal === 'SELL' ? 'rgba(231,76,60,0.3)' : 'var(--gold-border)'}`
          }}>● Signal: {m.signal}</div>
        )}
        <div style={{
          background: isAI ? 'var(--bg2)' : 'var(--bg3)',
          border: `1px solid ${isAI ? 'var(--gold-border)' : 'var(--border)'}`,
          borderRadius: isAI ? '0 12px 12px 12px' : '12px 0 12px 12px',
          padding: '14px 16px', fontSize: 14, lineHeight: 1.65, color: 'var(--text)'
        }}>
          {m.loading ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)', animation: `pulse 1.2s ${i * 0.2}s infinite` }} />
              ))}
              <span style={{ fontSize: 12, color: 'var(--text2)', marginLeft: 4 }}>Analysing market data...</span>
            </div>
          ) : m.text}
        </div>
        {isAI && m.rsi && (
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {[['RSI', m.rsi], ['MACD', m.macd], ['Price', `$${m.price}`]].map(([k, v]) => (
              <div key={k} style={{ background: 'var(--bg3)', borderRadius: 6, padding: '5px 10px', fontSize: 11 }}>
                <span style={{ color: 'var(--text3)' }}>{k} </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AIAdvisor({ priceData, API }) {
  const [messages, setMessages] = useState([{
    role: 'ai', signal: 'BUY',
    text: `Welcome to Aurum AI. I'm your personal gold trading analyst.\n\nI have live access to your XAU/USD price feed, open positions, and technical indicators. Ask me anything — whether to enter a trade, where to set your stop loss, or what the market is telling us right now.\n\nCurrent gold price: $${priceData.price?.toFixed(2) || '3342.80'}. Markets are open.`,
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    rsi: 61.4, macd: 'Bullish', price: priceData.price?.toFixed(2)
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(question) {
    const q = question || input.trim()
    if (!q || loading) return
    setInput('')
    const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [
      ...prev,
      { role: 'user', text: q, time: now },
      { role: 'ai', text: '', loading: true, time: now }
    ])
    setLoading(true)
    try {
      const r = await fetch(`${API}/ai/signal`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      })
      const d = await r.json()
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'ai', text: d.message || d.error, signal: d.signal, rsi: d.rsi, macd: d.macd, price: d.price, time: now, demo: d.demo }
      ])
    } catch {
      setMessages(prev => [...prev.slice(0, -1), { role: 'ai', text: 'Unable to reach AI service. Check your CLAUDE_API_KEY on the server.', time: now }])
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }} className="fade-in">
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400 }}>AI Advisor</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 3 }}>Powered by Claude · Live market data · Your positions included</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: 12 }}>
            <span style={{ color: 'var(--text2)' }}>XAU/USD </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>${priceData.price?.toFixed(2)}</span>
          </div>
          <button onClick={() => send('Give me a fresh market analysis and trading signal for gold right now')} style={{
            padding: '8px 14px', borderRadius: 8, border: '1px solid var(--gold-border)',
            background: 'rgba(201,146,42,0.1)', color: 'var(--gold-light)', fontSize: 12, fontWeight: 500
          }}>✦ Fresh signal</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {messages.map((m, i) => <Message key={i} m={m} />)}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ padding: '0 24px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)} disabled={loading} style={{
            padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border2)',
            background: 'var(--bg2)', color: 'var(--text2)', fontSize: 12, cursor: 'pointer',
            transition: 'all 0.15s', opacity: loading ? 0.5 : 1,
          }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.color = 'var(--gold-light)' }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.color = 'var(--text2)' }}
          >{q}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 24px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: '4px 4px 4px 16px', transition: 'border-color 0.2s' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about gold — market conditions, your P&L, when to trade..."
            disabled={loading}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 14, padding: '10px 0',
            }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: loading || !input.trim() ? 'var(--bg4)' : 'linear-gradient(135deg, #8B6310, #E8B84B)',
            color: loading || !input.trim() ? 'var(--text3)' : '#fff',
            fontSize: 14, fontWeight: 500, transition: 'all 0.2s'
          }}>
            {loading ? '...' : 'Ask ✦'}
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>AI advice is informational only — always apply your own judgment before trading.</p>
      </div>
    </div>
  )
}
