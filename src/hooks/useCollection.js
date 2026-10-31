import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { seed } from '../data/seed'

// Live Firestore collection. Falls back to demo data while empty/offline.
export function useCollection(name, sortKey) {
  const [items, setItems] = useState(seed[name] || [])
  const [live, setLive] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, name),
      (snap) => {
        if (snap.empty) return
        let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        if (sortKey) docs.sort((a, b) => (b[sortKey] ?? 0) - (a[sortKey] ?? 0))
        else docs.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
        setItems(docs)
        setLive(true)
      },
      (err) => console.warn(`[firestore:${name}]`, err.message)
    )
    return unsub
  }, [name, sortKey])

  return { items, live }
}
