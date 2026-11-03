import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { COL, seed } from '../data/seed'

// One-time update of competitions already saved in Firestore:
// old $5K funded-account prizes → $250 / $150 / $100 cash, and registration switched ON.
export async function runCompetitionMigrations() {
  const site = await getDoc(doc(db, COL.settings, 'site'))
  if (site.data()?.migrations?.cashPrizesV1) return 0
  const sample = seed.competitions[0]
  const snap = await getDocs(collection(db, COL.competitions))
  let n = 0
  for (const d of snap.docs) {
    const c = d.data()
    const old = c.prizePool === '$15,000' || (c.prizes || []).some((p) => /\$5K Funded/i.test(p.prize || ''))
    if (!old) continue
    await updateDoc(d.ref, {
      prizePool: sample.prizePool,
      prizes: sample.prizes,
      registrationOpen: true,
      ...(/wins a funded account/.test(c.description || '') ? { description: sample.description } : {}),
    })
    n++
  }
  await setDoc(doc(db, COL.settings, 'site'), { migrations: { cashPrizesV1: true } }, { merge: true })
  return n
}