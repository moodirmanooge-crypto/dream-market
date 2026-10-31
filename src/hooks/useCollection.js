import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { seed, COL } from '../data/seed'

export const byOrder = (a, b) => (a.order ?? 9999) - (b.order ?? 9999) || (b.number ?? 0) - (a.number ?? 0)

// Live Firestore collection (sorted by the admin's "order"). Demo data while empty.
export function useCollection(name) {
  const [items, setItems] = useState(seed[name] || [])
  useEffect(() => onSnapshot(
    collection(db, COL[name]),
    (snap) => { if (!snap.empty) setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((d) => !d.hidden).sort(byOrder)) },
    (err) => console.warn(`[firestore:${name}]`, err.message)
  ), [name])
  return items
}
