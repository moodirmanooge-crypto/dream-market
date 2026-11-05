import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { COL } from '../data/seed'
import { dayKey } from '../hooks/useTrack'
import { Counter } from './Stats'

// Public live visitor counter (English) — reads dreamStats/total and today's document
export default function VisitorCounter({ cfg }) {
  const [today, setToday] = useState(null)
  const [total, setTotal] = useState(null)
  useEffect(() => {
    const a = onSnapshot(doc(db, COL.stats, `day-${dayKey()}`), (d) => setToday(d.data() || {}), () => {})
    const b = onSnapshot(doc(db, COL.stats, 'total'), (d) => setTotal(d.data() || {}), () => {})
    return () => { a(); b() }
  }, [])
  if (!cfg?.show) return null
  const n = (v) => Number(v) || 0
  // admin-chosen starting numbers + the real counts (every new visit keeps adding)
  const items = [
    [cfg.today, n(today?.visitors)], [cfg.visitsToday, n(today?.visits)],
    [cfg.total, n(cfg.startTotalVisits) + n(total?.visits)], [cfg.totalVisitors, n(total?.visitors)],
  ]
  if (!today && !total && !items.some(([, v]) => v)) return null
  return (
    <section className="container vc">
      <div className="vc__head"><span className="live-dot vc__dot" />{cfg.label}</div>
      <div className="vc__grid">
        {items.map(([l, v]) => (
          <div key={l} className="vc__item"><strong><Counter key={v || 0} to={v || 0} /></strong><span>{l}</span></div>
        ))}
      </div>
    </section>
  )
}