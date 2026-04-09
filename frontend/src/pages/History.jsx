export default function History({ trades }) {
  const closed = trades.filter(t => !t.open).sort((a, b) => new Date(b.closedAt) - new Date(a.closedAt))
  const open   = trades.filter(t => t.open)
  const totalPnl  = closed.reduce((s, t) => s + t.pnl, 0)
  const wins      = closed.filter(t => t.pnl > 0)
  const losses    = closed.filter(t => t.pnl <= 0)
  const avgWin    = wins.length   ? wins.reduce((s, t)   => s + t.pnl, 0) / wins.length   : 0
  const avgLoss   = losses.length ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0
  const winRate   = closed.length ? Math.round(wins.length / closed.length * 100) : 0

  const StatBlock = ({ label, value, color }) => (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 1, marginBottom: 8 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 26, fontFamily: 'var(--font-mono)', fontWeight: 500, color: color || 'var(--text)' }}>{value}</div>
    </div>
  )

  return (
    <div style={{ padding: 24 }} className="fade-in">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, marginBottom: 6 }}>Trade History</h2>
      <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>Your complete trading record — closed positions, P&L, and performance stats.</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
        <StatBlock label="Total P&L" value={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`} color={totalPnl >= 0 ? 'var(--green)' : 'var(--red)'} />
        <StatBlock label="Win rate" value={`${winRate}%`} color={winRate >= 50 ? 'var(--green)' : 'var(--red)'} />
        <StatBlock label="Total trades" value={closed.length} />
        <StatBlock label="Avg win" value={`+$${avgWin.toFixed(2)}`} color="var(--green)" />
        <StatBlock label="Avg loss" value={`$${avgLoss.toFixed(2)}`} color="var(--red)" />
      </div>

      {/* Open positions */}
      {open.length > 0 && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--gold-border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--gold-light)', marginBottom: 14 }}>● Live positions</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'left' }}>
                {['Side','Size','Entry','Current','Live P&L','SL','TP','Opened'].map(h => (
                  <th key={h} style={{ padding: '6px 10px', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {open.map(t => (
                <tr key={t.id} style={{ fontSize: 13 }}>
                  <td style={{ padding: '10px 10px' }}><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: t.side === 'buy' ? 'var(--green-bg)' : 'var(--red-bg)', color: t.side === 'buy' ? 'var(--green)' : 'var(--red)', textTransform: 'uppercase' }}>{t.side}</span></td>
                  <td style={{ padding: '10px 10px', fontFamily: 'var(--font-mono)' }}>{t.qty} oz</td>
                  <td style={{ padding: '10px 10px', fontFamily: 'var(--font-mono)' }}>${t.entry?.toFixed(2)}</td>
                  <td style={{ padding: '10px 10px', fontFamily: 'var(--font-mono)' }}>${t.currentPrice?.toFixed(2)}</td>
                  <td style={{ padding: '10px 10px', fontFamily: 'var(--font-mono)', color: t.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>{t.pnl >= 0 ? '+' : ''}${t.pnl?.toFixed(2)}</td>
                  <td style={{ padding: '10px 10px', fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>${t.sl}</td>
                  <td style={{ padding: '10px 10px', fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>${t.tp}</td>
                  <td style={{ padding: '10px 10px', color: 'var(--text2)', fontSize: 12 }}>{new Date(t.openedAt).toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Closed trades */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Closed trades ({closed.length})</div>
        {closed.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 13 }}>No closed trades yet.</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'left' }}>
              {['Side','Size','Entry','Exit','P&L','Result','Closed'].map(h => (
                <th key={h} style={{ padding: '6px 10px', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {closed.map(t => (
              <tr key={t.id} style={{ fontSize: 13, borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '11px 10px' }}><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: t.side === 'buy' ? 'var(--green-bg)' : 'var(--red-bg)', color: t.side === 'buy' ? 'var(--green)' : 'var(--red)', textTransform: 'uppercase' }}>{t.side}</span></td>
                <td style={{ padding: '11px 10px', fontFamily: 'var(--font-mono)' }}>{t.qty} oz</td>
                <td style={{ padding: '11px 10px', fontFamily: 'var(--font-mono)' }}>${t.entry?.toFixed(2)}</td>
                <td style={{ padding: '11px 10px', fontFamily: 'var(--font-mono)' }}>${t.closePrice?.toFixed(2)}</td>
                <td style={{ padding: '11px 10px', fontFamily: 'var(--font-mono)', fontWeight: 500, color: t.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>{t.pnl >= 0 ? '+' : ''}${t.pnl?.toFixed(2)}</td>
                <td style={{ padding: '11px 10px' }}><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: t.pnl >= 0 ? 'var(--green-bg)' : 'var(--red-bg)', color: t.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>{t.pnl >= 0 ? 'Win' : 'Loss'}</span></td>
                <td style={{ padding: '11px 10px', color: 'var(--text2)', fontSize: 12 }}>{new Date(t.closedAt).toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
