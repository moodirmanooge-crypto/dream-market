import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth'
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { COL } from '../data/seed'

const SESSION_DAYS = 7

/*
  Login checks the username + password against the Firestore collection "admin-dream".
  The check happens inside Firestore Security Rules (server side), so passwords are never
  downloaded to the browser. A session document is created only if they match.
*/
export async function adminLogin(username, password) {
  username = username.trim()
  const cred = auth.currentUser || (await signInAnonymously(auth)).user
  const ref = doc(db, COL.sessions, cred.uid)
  // Admin document IDs that are tried: the username itself, then common IDs (e.g. "superadmin")
  const ids = [...new Set([username, username.toLowerCase(), 'superadmin', 'admin', 'super-admin'])]
  for (const adminId of ids) {
    try {
      await setDoc(ref, { adminId, username, password, createdAt: serverTimestamp() })
      return { uid: cred.uid, username, adminId }
    } catch { /* not this document — try next */ }
  }
  throw new Error('Username ama password waa khalad.')
}

export async function adminLogout() {
  const u = auth.currentUser
  if (u) { try { await deleteDoc(doc(db, COL.sessions, u.uid)) } catch { /* ignore */ } }
  await signOut(auth)
}

// Calls back with { username } when a valid session exists, otherwise null
export function watchAdmin(cb) {
  return onAuthStateChanged(auth, async (u) => {
    if (!u) return cb(null)
    try {
      const s = await getDoc(doc(db, COL.sessions, u.uid))
      const d = s.data()
      const fresh = d?.createdAt && Date.now() - d.createdAt.toMillis() < SESSION_DAYS * 864e5
      cb(fresh ? { uid: u.uid, username: d.username, adminId: d.adminId } : null)
    } catch { cb(null) }
  })
}
