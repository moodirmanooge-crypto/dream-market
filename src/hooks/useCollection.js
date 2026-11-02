import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { seed, COL } from '../data/seed'

export const byOrder = (a, b) => (a.order ?? 9999) - (b.order ?? 9999) || (b.number ?? 0) - (a.number ?? 0)

/*
  Live Firestore collection (sorted by the admin's "order").
  Default content is shown only until the admin manages that list (settings.seeded[name] = true);
  after that the website shows exactly what is in Firestore — so deleted items stay deleted.
*/
export function useCollection(name, seeded = {}) {
  const [docs, setDocs] = useState(null)
  useEffect(() => onSnapshot(
    collection(db, COL[name]),
    (snap) => setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((d) => !d.hidden).sort(byOrder)),
    (err) => console.warn(`[firestore:${name}]`, err.message)
  ), [name])
  if (docs && (docs.length || seeded[name])) return docs
  return seed[name] || []
}
