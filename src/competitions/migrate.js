import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { COL, seed } from '../data/seed'

export const isOldComp = (c) => c.prizePool === '$15,000' || (c.prizes || []).some((p) => /\$5K Funded/i.test(p.prize || ''))

// Updates one competition to the cash prizes ($250 / $150 / $100) and opens registration
export async function applyCashPrizes(id, c = {}) {
  const sample = seed.competitions[0]
  await updateDoc(doc(db, COL.competitions, id), {
    prizePool: sample.prizePool,
    prizes: sample.prizes,
    registrationOpen: true,
    ...(/wins a funded account/.test(c.description || '') ? { description: sample.description } : {}),
  })
}

// Runs automatically once when the admin logs in (force = run again from the button)
export async function runCompetitionMigrations(force = false) {
  if (!force) {
    const site = await getDoc(doc(db, COL.settings, 'site'))
    if (site.data()?.migrations?.cashPrizesV1) return 0
  }
  const snap = await getDocs(collection(db, COL.competitions))
  let n = 0
  for (const d of snap.docs) {
    if (!isOldComp(d.data())) continue
    await applyCashPrizes(d.id, d.data())
    n++
  }
  await setDoc(doc(db, COL.settings, 'site'), { migrations: { cashPrizesV1: true } }, { merge: true })
  return n
}

// Site-wide one-off fixes (run on every admin login; each one only changes old values)
export async function runSiteMigrations() {
  const ref = doc(db, COL.settings, 'site')
  const s = (await getDoc(ref)).data() || {}
  const patch = {}
  const email = s.contact?.email
  if (!email || email === 'hello@dreammarketpodcast.com') patch.contact = { email: 'dreammarketpodcast@gmail.com' }
  if (Object.keys(patch).length) await setDoc(ref, patch, { merge: true })
}
