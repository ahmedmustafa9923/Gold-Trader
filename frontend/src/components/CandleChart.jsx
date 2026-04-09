import { useRef, useEffect } from 'react'

export default function CandleChart({ candles, height = 300 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!candles.length || !canvasRef.current) return
    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1
    canvas.width  = canvas.offsetWidth  * dpr
    canvas.height = canvas.offsetHeight * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    ctx.clearRect(0, 0, W, H)

    const data = candles.slice(-40)
    const prices = data.flatMap(c => [c.high, c.low])
    const minP = Math.min(...prices)
    const maxP = Math.max(...prices)
    const range = maxP - minP || 1
    const padT = 20, padB = 30, padL = 10, padR = 60

    const toY = p => padT + ((maxP - p) / range) * (H - padT - padB)
    const candleW = Math.max(3, Math.floor((W - padL - padR) / data.length) - 2)
    const step = (W - padL - padR) / data.length

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 5; i++) {
      const y = padT + (i / 5) * (H - padT - padB)
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke()
      const price = maxP - (i / 5) * range
      ctx.fillStyle = 'rgba(155,152,144,0.6)'
      ctx.font = '10px JetBrains Mono, monospace'
      ctx.textAlign = 'left'
      ctx.fillText(price.toFixed(0), W - padR + 6, y + 3)
    }

    // Candles
    data.forEach((c, i) => {
      const x = padL + i * step + step / 2
      const oY = toY(c.open), cY = toY(c.close)
      const hY = toY(c.high), lY = toY(c.low)
      const bull = c.close >= c.open
      const color = bull ? '#2ECC71' : '#E74C3C'
      const bodyTop = Math.min(oY, cY)
      const bodyH = Math.max(Math.abs(cY - oY), 1)

      // Wick
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(x, hY); ctx.lineTo(x, lY); ctx.stroke()

      // Body
      ctx.fillStyle = bull ? 'rgba(46,204,113,0.25)' : 'rgba(231,76,60,0.25)'
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH)
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.strokeRect(x - candleW / 2, bodyTop, candleW, bodyH)
    })

    // Latest price line
    if (data.length) {
      const lastClose = data[data.length - 1].close
      const py = toY(lastClose)
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = 'rgba(201,146,42,0.5)'
      ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.moveTo(padL, py); ctx.lineTo(W - padR, py); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = 'var(--gold, #C9922A)'
      ctx.font = 'bold 10px JetBrains Mono, monospace'
      ctx.fillText(lastClose.toFixed(2), W - padR + 6, py + 3)
    }

    // Time labels
    ctx.fillStyle = 'rgba(155,152,144,0.5)'
    ctx.font = '9px DM Sans, sans-serif'
    ctx.textAlign = 'center'
    const labelEvery = Math.ceil(data.length / 6)
    data.forEach((c, i) => {
      if (i % labelEvery === 0) {
        const x = padL + i * step + step / 2
        const t = new Date(c.time)
        ctx.fillText(`${t.getHours()}:${String(t.getMinutes()).padStart(2,'0')}`, x, H - 8)
      }
    })
  }, [candles])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: height, display: 'block' }}
    />
  )
}
