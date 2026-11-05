import { collection, deleteField, doc, getDoc, getDocs, setDoc, updateDoc, writeBatch } from 'firebase/firestore'
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
  if (!s.sections?.competitions || s.sections.competitions.title === 'Compete. Prove your skills.') patch.sections = { competitions: (await import('../data/seed')).defaultSettings.sections.competitions }
  if (Object.keys(patch).length) await setDoc(ref, patch, { merge: true })
}

// Privacy + completeness fix for participants (runs on every admin login, cheap when nothing to do):
//  - every non-rejected registration gets a public card (so all joined traders are visible)
//  - lucky numbers are removed from public cards / number docs (only admin + the owner can see them)
export async function runParticipantsMigration() {
  const [regs, pubs, lucky] = await Promise.all([getDocs(collection(db, COL.regs)), getDocs(collection(db, COL.compPublic)), getDocs(collection(db, COL.lucky))])
  const pubIds = new Set(pubs.docs.map((d) => d.id))
  const b = writeBatch(db); let n = 0
  regs.docs.forEach((d) => {
    const r = d.data()
    if (r.status === 'rejected' || pubIds.has(d.id) || n > 400) return
    b.set(doc(db, COL.compPublic, d.id), { compId: r.compId, name: r.fullName || '', country: r.country || '', photo: r.photo || '', uid: r.uid || '', ...(r.luckyNumber ? { hasLucky: true } : {}), createdAt: r.createdAt || new Date() }); n++
  })
  pubs.docs.forEach((d) => { if ('luckyNumber' in d.data() && n < 450) { b.update(d.ref, { luckyNumber: deleteField(), hasLucky: true }); n++ } })
  lucky.docs.forEach((d) => { const x = d.data(); if (('name' in x || 'photo' in x) && n < 480) { b.update(d.ref, { name: deleteField(), photo: deleteField() }); n++ } })
  if (n) await b.commit()
  return n
}
