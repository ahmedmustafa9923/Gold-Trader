import { useState } from 'react'

const AMOUNTS = [500, 1000, 2500, 5000, 10000]

export default function Deposit({ priceData, refreshAll, API }) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('bank')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState(null)

  async function submit() {
    const val = parseFloat(amount)
    if (!val || val < 100) return setMsg({ type: 'error', text: 'Minimum deposit is $100' })
    setSubmitting(true); setMsg(null)
    try {
      const r = await fetch(`${API}/deposit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: val })
      })
      const d = await r.json()
      if (d.success) {
        setMsg({ type: 'success', text: `✓ $${val.toLocaleString()} deposited successfully. New balance: $${d.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` })
        setAmount(''); refreshAll()
      } else setMsg({ type: 'error', text: d.error || 'Deposit failed' })
    } catch { setMsg({ type: 'error', text: 'Network error' }) }
    setSubmitting(false)
  }

  const METHODS = [
    { id: 'bank',   label: 'Bank Transfer', sub: '1-3 business days · No fee', icon: '🏦' },
    { id: 'card',   label: 'Debit Card',    sub: 'Instant · 0.5% fee',          icon: '💳' },
    { id: 'crypto', label: 'Crypto (USDT)', sub: 'Instant · Network fee only',  icon: '◈' },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 680 }} className="fade-in">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, marginBottom: 6 }}>Deposit Funds</h2>
      <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>Add funds to your trading account to open new positions.</p>

      {/* Balance card */}
      <div style={{ background: 'linear-gradient(135deg, var(--bg2), var(--bg3))', border: '1px solid var(--gold-border)', borderRadius: 16, padding: '24px 28px', marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: 'var(--gold)', letterSpacing: 2, marginBottom: 8 }}>CURRENT BALANCE</div>
        <div style={{ fontSize: 38, fontFamily: 'var(--font-mono)', color: 'var(--text)', marginBottom: 4 }}>
          ${priceData.portfolio?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>
          Equity: ${priceData.portfolio?.equity?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          &nbsp;·&nbsp; Open P&L: <span style={{ color: priceData.openPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>{priceData.openPnl >= 0 ? '+' : ''}${priceData.openPnl?.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment method */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Payment method</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {METHODS.map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)} style={{
              flex: 1, padding: '14px 12px', borderRadius: 'var(--radius)', textAlign: 'left',
              border: `1px solid ${method === m.id ? 'var(--gold)' : 'var(--border)'}`,
              background: method === m.id ? 'rgba(201,146,42,0.08)' : 'var(--bg2)', cursor: 'pointer'
            }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: method === m.id ? 'var(--gold-light)' : 'var(--text)' }}>{m.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{m.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick amounts */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Quick amounts</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {AMOUNTS.map(a => (
            <button key={a} onClick={() => setAmount(String(a))} style={{
              flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)',
              border: `1px solid ${amount === String(a) ? 'var(--gold)' : 'var(--border)'}`,
              background: amount === String(a) ? 'rgba(201,146,42,0.1)' : 'var(--bg2)',
              color: amount === String(a) ? 'var(--gold-light)' : 'var(--text2)',
              fontSize: 13, fontFamily: 'var(--font-mono)', cursor: 'pointer'
            }}>${a.toLocaleString()}</button>
          ))}
        </div>
      </div>

      {/* Custom amount */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Or enter amount</div>
        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <span style={{ padding: '12px 14px', background: 'var(--bg3)', color: 'var(--text2)', fontSize: 15, fontFamily: 'var(--font-mono)' }}>$</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min="100"
            style={{ flex: 1, padding: '12px 14px', background: 'var(--bg2)', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 18, fontFamily: 'var(--font-mono)' }} />
          <span style={{ padding: '12px 14px', background: 'var(--bg3)', color: 'var(--text3)', fontSize: 13 }}>USD</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Minimum: $100 · Maximum: $100,000</div>
      </div>

      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: 14, background: msg.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)', color: msg.type === 'success' ? 'var(--green)' : 'var(--red)', border: `1px solid ${msg.type === 'success' ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)'}` }}>
          {msg.text}
        </div>
      )}

      <button onClick={submit} disabled={submitting || !amount} style={{
        width: '100%', padding: '16px', borderRadius: 'var(--radius-sm)', border: 'none',
        background: submitting || !amount ? 'var(--bg4)' : 'linear-gradient(135deg, #8B6310, #E8B84B)',
        color: submitting || !amount ? 'var(--text3)' : '#fff',
        fontSize: 16, fontWeight: 600, cursor: submitting || !amount ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
      }}>
        {submitting ? 'Processing...' : `Deposit ${amount ? '$' + parseFloat(amount).toLocaleString() : 'funds'}`}
      </button>

      <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text2)' }}>Demo mode:</strong> This is a paper trading environment. No real funds are transferred. Connect a real payment gateway (Stripe) and brokerage API (Alpaca, OANDA) to enable live trading.
      </div>
    </div>
  )
}
