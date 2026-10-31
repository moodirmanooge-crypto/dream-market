import { useEffect, useState } from 'react'

export default function Loader() {
  const [done, setDone] = useState(false)
  const [gone, setGone] = useState(false)
  useEffect(() => {
    const t1 = setTimeout(() => setDone(true), 1700)
    const t2 = setTimeout(() => setGone(true), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  if (gone) return null
  return (
    <div className={`loader ${done ? 'loader--out' : ''}`}>
      <div className="loader__logo">
        {'DMP'.split('').map((c, i) => <span key={i} style={{ animationDelay: `${i * 0.15}s` }}>{c}</span>)}
      </div>
      <div className="loader__bar"><i /></div>
      <p className="loader__tag">Where Financial Minds Meet</p>
    </div>
  )
}
