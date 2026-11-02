import { useEffect, useState } from 'react'

export default function Countdown({ at, text, compact }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  const diff = Math.max(0, at - now)
  const parts = [['Days', Math.floor(diff / 864e5)], ['Hours', Math.floor(diff / 36e5) % 24], ['Min', Math.floor(diff / 6e4) % 60], ['Sec', Math.floor(diff / 1e3) % 60]]
  return (
    <div className={`cd ${compact ? 'cd--compact' : ''}`}>
      <small>{text}</small>
      <div className="cd__parts">
        {parts.map(([l, v]) => <div key={l}><strong>{String(v).padStart(2, '0')}</strong><span>{l}</span></div>)}
      </div>
    </div>
  )
}
