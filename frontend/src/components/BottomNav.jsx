const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'trade',     label: 'Trade',     icon: '⚡' },
  { id: 'ai',        label: 'AI',        icon: '✦' },
  { id: 'history',   label: 'History',   icon: '◷' },
  { id: 'deposit',   label: 'Deposit',   icon: '+' },
]

export default function BottomNav({ page, setPage }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      display: 'flex', background: 'var(--bg2)',
      borderTop: '1px solid var(--border)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {NAV.map(n => (
        <button key={n.id} onClick={() => setPage(n.id)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 3, padding: '10px 4px',
          border: 'none', background: 'transparent',
          color: page === n.id ? 'var(--gold-light)' : 'var(--text3)',
          minHeight: 60, minWidth: 44,
          borderTop: `2px solid ${page === n.id ? 'var(--gold)' : 'transparent'}`,
        }}>
          <span style={{ fontSize: 18 }}>{n.icon}</span>
          <span style={{ fontSize: 10, fontWeight: page === n.id ? 500 : 400 }}>{n.label}</span>
        </button>
      ))}
    </nav>
  )
}
