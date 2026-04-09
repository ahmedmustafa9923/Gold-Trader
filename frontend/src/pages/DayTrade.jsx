import { useState } from 'react'
import CandleChart from '../components/CandleChart.jsx'

function Field({ label, value, onChange, type = 'number', hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{label}</span>
        {hint && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{hint}</span>}
      </div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{
        width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border2)', background: 'var(--bg3)',
        color: 'var(--text)', fontSize: 15, fontFamily: 'var(--font-mono)',
        outline: 'none', transition: 'border-color 0.2s',
      }}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--border2)'}
      />
    </div>
  )
}

export default function DayTrade({ priceData, candles, trades, refreshAll, API }) {
  const [side, setSide] = useState('buy')
  const [qty, setQty] = useState('0.5')
  const [sl, setSl] = useState('')
  const [tp, setTp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState(null)
  const [closing, setClosing] = useState(null)

  const open = trades.filter(t => t.open)
  const price = priceData.price || 0
  const cost = (parseFloat(qty) || 0) * price

  const defaultSl = side === 'buy'
    ? (price - 40).toFixed(2)
    : (price + 40).toFixed(2)
  const defaultTp = side === 'buy'
    ? (price + 60).toFixed(2)
    : (price - 60).toFixed(2)

  async function placeTrade() {
    setSubmitting(true); setMsg(null)
    try {
      const r = await fetch(`${API}/trades`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ side, qty: parseFloat(qty), sl: parseFloat(sl || defaultSl), tp: parseFloat(tp || defaultTp) })
      })
      const d = await r.json()
      if (d.success) { setMsg({ type: 'success', text: `✓ ${side.toUpperCase()} order placed at $${d.trade.entry.toFixed(2)}` }); refreshAll() }
      else setMsg({ type: 'error', text: d.error || 'Failed to place order' })
    } catch { setMsg({ type: 'error', text: 'Network error — try again' }) }
    setSubmitting(false)
  }

  async function closeTrade(id) {
    setClosing(id)
    try {
      const r = await fetch(`${API}/trades/${id}/close`, { method: 'POST' })
      const d = await r.json()
      if (d.success) { setMsg({ type: 'success', text: `✓ Position closed at $${d.trade.closePrice?.toFixed(2)} · P&L: ${d.trade.pnl >= 0 ? '+' : ''}$${d.trade.pnl?.toFixed(2)}` }); refreshAll() }
    } catch {}
    setClosing(null)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }} className="fade-in">
      {/* Left: chart + positions */}
      <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, marginBottom: 6 }}>Day Trade</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>Place and manage your XAU/USD positions in real time.</p>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>XAU/USD Live Chart</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="live-dot" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--text)' }}>${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <CandleChart candles={candles} height={280} />
        </div>

        {/* Open positions table */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Open positions ({open.length})</div>
          {open.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 13 }}>No open positions. Place a trade on the right.</p>}
          {open.map(t => (
            <div key={t.id} style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr auto',
              gap: 16, alignItems: 'center', padding: '12px 14px',
              background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', marginBottom: 8
            }}>
              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: t.side === 'buy' ? 'var(--green-bg)' : 'var(--red-bg)', color: t.side === 'buy' ? 'var(--green)' : 'var(--red)', fontWeight: 600, textTransform: 'uppercase' }}>{t.side}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t.qty} oz</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>Entry ${t.entry?.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>SL / TP</div>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>${t.sl} / ${t.tp}</div>
              </div>
              <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 500, color: t.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {t.pnl >= 0 ? '+' : ''}${t.pnl?.toFixed(2)}
              </div>
              <button onClick={() => closeTrade(t.id)} disabled={closing === t.id} style={{
                padding: '7px 14px', borderRadius: 6, border: '1px solid var(--red)',
                background: 'transparent', color: 'var(--red)', fontSize: 12, fontWeight: 500
              }}>{closing === t.id ? '...' : 'Close'}</button>
            </div>
          ))}
        </div>
      </div>

      {/* Right: order form */}
      <div style={{ width: 320, flexShrink: 0, background: 'var(--bg2)', borderLeft: '1px solid var(--border)', padding: 24, overflow: 'auto' }}>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 20 }}>Place order</div>

        {/* Buy / Sell toggle */}
        <div style={{ display: 'flex', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 20 }}>
          {['buy', 'sell'].map(s => (
            <button key={s} onClick={() => setSide(s)} style={{
              flex: 1, padding: '11px', border: 'none', textTransform: 'capitalize',
              fontWeight: 600, fontSize: 14, transition: 'all 0.15s',
              background: side === s ? (s === 'buy' ? 'var(--green)' : 'var(--red)') : 'transparent',
              color: side === s ? '#fff' : 'var(--text2)'
            }}>{s}</button>
          ))}
        </div>

        <Field label="Amount (oz)" value={qty} onChange={setQty} hint={`Cost ≈ $${cost.toFixed(0)}`} />

        {/* Quick size buttons */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {['0.1','0.5','1','2','5'].map(v => (
            <button key={v} onClick={() => setQty(v)} style={{
              flex: 1, padding: '6px 4px', borderRadius: 6, border: '1px solid var(--border2)',
              background: qty === v ? 'rgba(201,146,42,0.15)' : 'transparent',
              color: qty === v ? 'var(--gold-light)' : 'var(--text2)', fontSize: 12
            }}>{v}</button>
          ))}
        </div>

        <Field label="Stop Loss" value={sl} onChange={setSl} hint={`Suggested: $${defaultSl}`} />
        <Field label="Take Profit" value={tp} onChange={setTp} hint={`Suggested: $${defaultTp}`} />

        {/* Summary */}
        <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', padding: 14, marginBottom: 20, fontSize: 13 }}>
          {[['Direction', side.toUpperCase()],['Entry price', `$${price.toFixed(2)}`],['Est. cost', `$${cost.toFixed(2)}`],['Spread', '0.20'],['Leverage', '1:1']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text2)' }}>{k}</span>
              <span style={{ fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{v}</span>
            </div>
          ))}
        </div>

        {msg && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 14, fontSize: 13, background: msg.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)', color: msg.type === 'success' ? 'var(--green)' : 'var(--red)', border: `1px solid ${msg.type === 'success' ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)'}` }}>
            {msg.text}
          </div>
        )}

        <button onClick={placeTrade} disabled={submitting} style={{
          width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', border: 'none',
          background: side === 'buy' ? 'var(--green)' : 'var(--red)',
          color: '#fff', fontSize: 16, fontWeight: 600, transition: 'opacity 0.2s',
          opacity: submitting ? 0.6 : 1
        }}>
          {submitting ? 'Placing...' : `${side === 'buy' ? 'Buy' : 'Sell'} XAU/USD`}
        </button>

        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 12, lineHeight: 1.5 }}>
          Demo mode — no real money at risk. Connect a broker API to enable live execution.
        </p>
      </div>
    </div>
  )
}
