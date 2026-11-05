import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { COL } from '../data/seed'
import { Counter } from './Stats'

// Public live counter — shows ONE number: Total Visits (admin start number + every real visit)
export default function VisitorCounter({ cfg }) {
  const [total, setTotal] = useState(null)
  useEffect(() => onSnapshot(doc(db, COL.stats, 'total'), (d) => setTotal(d.data() || {}), () => {}), [])
  if (!cfg?.show) return null
  const value = (Number(cfg.startTotalVisits) || 0) + (Number(total?.visits) || 0)
  if (!total && !value) return null
  return (
    <section className="container vc vc--one">
      <div className="vc__head"><span className="live-dot vc__dot" />{cfg.label}</div>
      <div className="vc__item"><strong><Counter key={value} to={value} /></strong><span>{cfg.total}</span></div>
    </section>
  )
}