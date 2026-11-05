import { signInAnonymously } from 'firebase/auth'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { auth, storage } from '../firebase'

export const LUCKY_MIN = 1
export const LUCKY_MAX = 1000

// ---------- validation ----------
export const NAME_RE = /^[\p{L}][\p{L}' .-]*$/u
export function nameError(v = '') {
  const s = v.trim().replace(/\s+/g, ' ')
  if (!s) return 'Please enter your full name.'
  if (!NAME_RE.test(s)) return 'Name can only contain letters (no numbers or symbols).'
  const parts = s.split(' ').filter((p) => p.replace(/[^\p{L}]/gu, '').length >= 2)
  if (parts.length < 2) return 'Please enter your first and last name.'
  if (s.length > 60) return 'Name is too long.'
  return ''
}
export const EMAIL_RE = /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/i
export function emailError(v = '') {
  const s = v.trim()
  if (!s) return 'Email is required.'
  if (!EMAIL_RE.test(s) || s.includes('..')) return 'Please enter a valid email address (example: name@gmail.com).'
  return ''
}
export function phoneError(v = '') {
  const digits = v.replace(/\D/g, '')
  if (!/^[+\d\s()-]+$/.test(v.trim())) return 'WhatsApp number can only contain digits.'
  if (digits.length < 7 || digits.length > 15) return 'Please enter a valid WhatsApp number with country code.'
  return ''
}
export const cleanName = (v = '') => v.trim().replace(/\s+/g, ' ').replace(/\b\p{L}/gu, (c) => c.toUpperCase())

// ---------- anonymous visitor identity (needed for photo upload + lucky number) ----------
export async function ensureUser() {
  return auth.currentUser || (await signInAnonymously(auth)).user
}

// ---------- photo: shrink to max 640px JPEG, then upload ----------
export function shrinkImage(file, max = 640, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) return reject(new Error('Please choose an image file.'))
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not read the image.'))), 'image/jpeg', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read the image.')) }
    img.src = url
  })
}
export async function uploadPhoto(blob, uid) {
  const r = ref(storage, `dream/participants/${uid}/${Date.now()}.jpg`)
  await uploadBytes(r, blob, { contentType: 'image/jpeg' })
  return getDownloadURL(r)
}

// ---------- remember this browser's registration ----------
const key = (compId) => `dmp-reg-${compId}`
export const getMyReg = (compId) => { try { return JSON.parse(localStorage.getItem(key(compId)) || 'null') } catch { return null } }
export const saveMyReg = (compId, v) => { try { localStorage.setItem(key(compId), JSON.stringify(v)) } catch { /* ignore */ } }
export const randomLucky = (taken = new Set()) => {
  if (taken.size >= LUCKY_MAX) return null
  let n
  do n = LUCKY_MIN + Math.floor(Math.random() * (LUCKY_MAX - LUCKY_MIN + 1)); while (taken.has(n))
  return n
}
export const initials = (n = '') => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

// ---------- one registration per device / email / name (per competition) ----------
export const nameKey = (v = '') => v.trim().toLowerCase().normalize('NFKD').replace(/[^\p{L}]+/gu, '')
export const regIdFor = (compId, uid) => `${compId}_${uid}`
export const emailLockId = (compId, email) => `${compId}_${email.trim().toLowerCase()}`
export const nameLockId = (compId, name) => `${compId}_${nameKey(name)}`
