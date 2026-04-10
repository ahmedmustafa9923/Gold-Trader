import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import BottomNav from './components/BottomNav.jsx'
import Dashboard from './pages/Dashboard.jsx'
import DayTrade from './pages/DayTrade.jsx'
import History from './pages/History.jsx'
import AIAdvisor from './pages/AIAdvisor.jsx'
import Deposit from './pages/Deposit.jsx'

const API = '/api'

export function useBreakpoint() {
  const [bp, setBp] = useState(() => {
    const w = window.innerWidth
    if (w <= 200) return 'watch'
    if (w <= 480) return 'phone'
    if (w <= 767) return 'phoneLandscape'
    if (w <= 1024) return 'tablet'
    return 'desktop'
  })
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth
      if (w <= 200) setBp('watch')
      else if (w <= 480) setBp('phone')
      else if (w <= 767) setBp('phoneLandscape')
      else if (w <= 1024) setBp('tablet')
      else setBp('desktop')
    }
    window.addEventListener('resize', calc)
    window.addEventListener('orientationchange', () => setTimeout(calc, 100))
    return () => window.removeEventListener('resize', calc)
  }, [])
  return bp
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [priceData, setPriceData] = useState({
    price: 3342.80, change: 18.40, changePct: 0.553,
    high: 3358.20, low: 3301.50, openPnl: 22.20,
    portfolio: { balance: 48290.60, equity: 48312.80 }
  })
  const [candles, setCandles] = useState([])
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const bp = useBreakpoint()
  const isMobile = bp === 'phone' || bp === 'watch'
  const isTablet = bp === 'tablet' || bp === 'phoneLandscape'
  const showBottomNav = isMobile

  const fetchPrice = useCallback(async () => {
    try { const r = await fetch(`${API}/price`); const d = await r.json(); setPriceData(d) } catch {}
  }, [])
  const fetchCandles = useCallback(async () => {
    try { const r = await fetch(`${API}/candles`); const d = await r.json(); setCandles(d) } catch {}
  }, [])
  const fetchTrades = useCallback(async () => {
    try { const r = await fetch(`${API}/trades`); const d = await r.json(); setTrades(d) } catch {}
  }, [])

  useEffect(() => {
    Promise.all([fetchPrice(), fetchCandles(), fetchTrades()]).finally(() => setLoading(false))
    const pi = setInterval(fetchPrice, 2000)
    const ti = setInterval(fetchTrades, 3000)
    const ci = setInterval(fetchCandles, 15000)
    return () => { clearInterval(pi); clearInterval(ti); clearInterval(ci) }
  }, [])

  const refreshAll = () => { fetchPrice(); fetchCandles(); fetchTrades() }
  const pageProps = { priceData, candles, trades, refreshAll, API, bp }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {sidebarOpen && isMobile && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} />
      )}
      {(!isMobile || sidebarOpen) && (
        <Sidebar page={page} setPage={(p) => { setPage(p); setSidebarOpen(false) }}
          priceData={priceData} bp={bp} isOverlay={sidebarOpen && isMobile}
          onClose={() => setSidebarOpen(false)} isTablet={isTablet} />
      )}
      <main style={{
        flex: 1, overflow: 'auto', background: 'var(--bg)',
        paddingBottom: showBottomNav ? 'calc(64px + env(safe-area-inset-bottom))' : 0,
        paddingTop: isMobile ? 'env(safe-area-inset-top)' : 0,
        minWidth: 0,
      }}>
        {isMobile && (
          <div style={{
            position: 'sticky', top: 0, zIndex: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', background: 'var(--bg2)',
            borderBottom: '1px solid var(--border)',
          }}>
            <button onClick={() => setSidebarOpen(true)} style={{
              background: 'transparent', border: 'none', color: 'var(--text)',
              fontSize: 20, minWidth: 44, minHeight: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>☰</button>
            <span style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-light)', fontSize: 16, letterSpacing: 1 }}>AURUM</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
                ${priceData.price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: 10, color: priceData.changePct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {priceData.changePct >= 0 ? '▲' : '▼'} {Math.abs(priceData.changePct).toFixed(2)}%
              </div>
            </div>
          </div>
        )}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
            <div style={{ width: 40, height: 40, border: '2px solid var(--border2)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>Loading Aurum...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {page === 'dashboard' && <Dashboard {...pageProps} />}
            {page === 'trade' && <DayTrade {...pageProps} />}
            {page === 'history' && <History {...pageProps} />}
            {page === 'ai' && <AIAdvisor {...pageProps} />}
            {page === 'deposit' && <Deposit {...pageProps} />}
          </>
        )}
      </main>
      {showBottomNav && <BottomNav page={page} setPage={setPage} />}
    </div>
  )
}
