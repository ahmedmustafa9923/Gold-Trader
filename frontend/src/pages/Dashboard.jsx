import CandleChart from '../components/CandleChart.jsx'

const TF = ['1m','5m','15m','1H','4H','1D']

function StatCard({ label, value, sub, subColor }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '16px 20px'
    }}>
      <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 1, marginBottom: 8 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 24, fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: subColor || 'var(--text2)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard({ priceData, candles, trades }) {
  const up = priceData.changePct >= 0
  const open = trades.filter(t => t.open)
  const closed = trades.filter(t => !t.open)
  const totalPnl = closed.reduce((s, t) => s + t.pnl, 0)
  const winRate = closed.length ? Math.round(closed.filter(t => t.pnl > 0).length / closed.length * 100) : 0

  return (
    <div style={{ padding: 24, minHeight: '100vh' }} className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', fontWeight: 400 }}>
            Good morning, John
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
            Gold is {up ? 'up' : 'down'} {Math.abs(priceData.changePct).toFixed(2)}% today — markets look {up ? 'bullish' : 'cautious'}.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
            ${priceData.price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 14, color: up ? 'var(--green)' : 'var(--red)', marginTop: 2 }}>
            {up ? '▲' : '▼'} {up ? '+' : ''}{priceData.change?.toFixed(2)} ({up ? '+' : ''}{priceData.changePct?.toFixed(3)}%)
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Open P&L" value={`${priceData.openPnl >= 0 ? '+' : ''}$${priceData.openPnl?.toFixed(2)}`}
          sub={priceData.openPnl >= 0 ? '▲ Profitable' : '▼ In loss'}
          subColor={priceData.openPnl >= 0 ? 'var(--green)' : 'var(--red)'} />
        <StatCard label="Day High" value={`$${priceData.high?.toFixed(2)}`} sub="Session peak" />
        <StatCard label="Day Low"  value={`$${priceData.low?.toFixed(2)}`}  sub="Session floor" />
        <StatCard label="Win Rate" value={`${winRate}%`}
          sub={`${closed.filter(t=>t.pnl>0).length} wins / ${closed.length} total`}
          subColor={winRate >= 50 ? 'var(--green)' : 'var(--red)'} />
      </div>

      {/* Chart */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 500 }}>XAU / USD</span>
            <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 10 }}>Candlestick — 15m</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {TF.map((t, i) => (
              <button key={t} style={{
                padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
                background: i === 2 ? 'rgba(201,146,42,0.15)' : 'transparent',
                color: i === 2 ? 'var(--gold-light)' : 'var(--text2)',
                fontSize: 12, cursor: 'pointer'
              }}>{t}</button>
            ))}
          </div>
        </div>
        <CandleChart candles={candles} height={300} />
      </div>

      {/* Open positions + recent trades */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Open positions */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Open positions</div>
          {open.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 13 }}>No open positions</p>}
          {open.map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', marginBottom: 8 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>XAU/USD</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: t.side === 'buy' ? 'var(--green-bg)' : 'var(--red-bg)', color: t.side === 'buy' ? 'var(--green)' : 'var(--red)', textTransform: 'uppercase', fontWeight: 600 }}>{t.side}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3 }}>{t.qty} oz · Entry ${t.entry?.toFixed(2)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 500, fontFamily: 'var(--font-mono)', color: t.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {t.pnl >= 0 ? '+' : ''}${t.pnl?.toFixed(2)}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>Live</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent trades */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Recent trades</span>
            <span style={{ fontSize: 12, color: 'var(--gold)', cursor: 'pointer' }}>See all →</span>
          </div>
          {closed.slice(0, 4).map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{new Date(t.closedAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short' })}</span>
                <span style={{ fontSize: 12, color: 'var(--text2)', marginLeft: 8, textTransform: 'capitalize' }}>{t.side} · {t.qty} oz</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-mono)', color: t.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {t.pnl >= 0 ? '+' : ''}${t.pnl?.toFixed(2)}
              </span>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: '10px 0', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>Total realised P&L</span>
            <span style={{ float: 'right', fontSize: 15, fontWeight: 500, fontFamily: 'var(--font-mono)', color: totalPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
