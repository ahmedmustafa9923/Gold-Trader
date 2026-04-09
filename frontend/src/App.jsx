import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import DayTrade from './pages/DayTrade.jsx'
import History from './pages/History.jsx'
import AIAdvisor from './pages/AIAdvisor.jsx'
import Deposit from './pages/Deposit.jsx'

const API = '/api'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [priceData, setPriceData] = useState({
    price: 3342.80, change: 18.40, changePct: 0.553,
    high: 3358.20, low: 3301.50, openPnl: 22.20,
    portfolio: { balance: 48290.60, equity: 48312.80 }
  })
  const [candles, setCandles] = useState([])
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPrice = useCallback(async () => {
    try {
      const r = await fetch(`${API}/price`)
      const d = await r.json()
      setPriceData(d)
    } catch {}
  }, [])

  const fetchCandles = useCallback(async () => {
    try {
      const r = await fetch(`${API}/candles`)
      const d = await r.json()
      setCandles(d)
    } catch {}
  }, [])

  const fetchTrades = useCallback(async () => {
    try {
      const r = await fetch(`${API}/trades`)
      const d = await r.json()
      setTrades(d)
    } catch {}
  }, [])

  useEffect(() => {
    Promise.all([fetchPrice(), fetchCandles(), fetchTrades()])
      .finally(() => setLoading(false))
    const priceInterval = setInterval(fetchPrice, 2000)
    const tradeInterval = setInterval(fetchTrades, 3000)
    const candleInterval = setInterval(fetchCandles, 15000)
    return () => {
      clearInterval(priceInterval)
      clearInterval(tradeInterval)
      clearInterval(candleInterval)
    }
  }, [])

  const refreshAll = () => {
    fetchPrice(); fetchCandles(); fetchTrades()
  }

  const pageProps = { priceData, candles, trades, refreshAll, API }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar page={page} setPage={setPage} priceData={priceData} />
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 16 }}>
            <div style={{ width: 40, height: 40, border: '2px solid var(--border2)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>Loading Aurum...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {page === 'dashboard' && <Dashboard {...pageProps} />}
            {page === 'trade'     && <DayTrade  {...pageProps} />}
            {page === 'history'   && <History   {...pageProps} />}
            {page === 'ai'        && <AIAdvisor {...pageProps} />}
            {page === 'deposit'   && <Deposit   {...pageProps} />}
          </>
        )}
      </main>
    </div>
  )
}
