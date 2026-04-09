const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'trade',     label: 'Day Trade',  icon: '⚡' },
  { id: 'ai',        label: 'AI Advisor', icon: '✦' },
  { id: 'history',   label: 'History',    icon: '◷' },
  { id: 'deposit',   label: 'Deposit',    icon: '+' },
]

export default function Sidebar({ page, setPage, priceData }) {
  const up = priceData.changePct >= 0
  return (
    <aside style={{
      width: 220, flexShrink: 0, background: 'var(--bg2)',
      borderRight: '1px solid var(--border)', display: 'flex',
      flexDirection: 'column', padding: '20px 0', overflow: 'hidden'
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #8B6310, #E8B84B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#fff', fontFamily: 'var(--font-display)'
          }}>Au</div>
          <div>
            <div style={{ fontSize: 17, fontFamily: 'var(--font-display)', color: 'var(--gold-light)', letterSpacing: 1 }}>AURUM</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 2 }}>GOLD TRADING</div>
          </div>
        </div>
      </div>

      {/* Live price pill */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, letterSpacing: 1 }}>XAU / USD</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 22, fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text)' }}>
            {priceData.price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div style={{ fontSize: 12, color: up ? 'var(--green)' : 'var(--red)', marginTop: 2 }}>
          {up ? '▲' : '▼'} {Math.abs(priceData.changePct).toFixed(3)}% today
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <span className="live-dot" />
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>LIVE MARKET</span>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 12px' }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 12px', borderRadius: 'var(--radius-sm)',
            border: 'none', background: page === n.id ? 'rgba(201,146,42,0.12)' : 'transparent',
            color: page === n.id ? 'var(--gold-light)' : 'var(--text2)',
            fontSize: 14, fontWeight: page === n.id ? 500 : 400,
            marginBottom: 2, transition: 'all 0.15s', textAlign: 'left',
            borderLeft: page === n.id ? '2px solid var(--gold)' : '2px solid transparent',
          }}>
            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      {/* Portfolio summary */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 6, letterSpacing: 1 }}>PORTFOLIO</div>
        <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
          ${priceData.portfolio?.equity?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: 12, marginTop: 3, color: priceData.openPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
          Open P&L: {priceData.openPnl >= 0 ? '+' : ''}${priceData.openPnl?.toFixed(2)}
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 600 }}>JD</div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text)' }}>John Doe</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>Day Trader</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
