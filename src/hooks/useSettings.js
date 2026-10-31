import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { defaultSettings, COL } from '../data/seed'

// Deep-merge saved settings over defaults (arrays from Firestore replace defaults)
export function mergeDeep(base, over) {
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return over ?? base
  const out = { ...base }
  for (const k of Object.keys(over || {})) {
    out[k] = typeof base[k] === 'object' && base[k] !== null && !Array.isArray(base[k]) ? mergeDeep(base[k], over[k]) : over[k] ?? base[k]
  }
  return out
}

export function useSettings() {
  const [s, setS] = useState(defaultSettings)
  useEffect(() => onSnapshot(
    doc(db, COL.settings, 'site'),
    (d) => d.exists() && setS(mergeDeep(defaultSettings, d.data())),
    (err) => console.warn('[firestore:settings]', err.message)
  ), [])
  return s
}
