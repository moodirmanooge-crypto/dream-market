import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getMessaging, getToken, isSupported } from 'firebase/messaging'
import { app, db } from '../firebase'

export const TOKENS = 'dreamAdminTokens'
const SW_URL = '/firebase-messaging-sw.js'
const pref = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v === '1' } catch { return d } }
export const soundOn = () => pref('dmp-sound', true)
export const setSoundOn = (v) => { try { localStorage.setItem('dmp-sound', v ? '1' : '0') } catch { /* ignore */ } }

export const supported = () => typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator
export const permission = () => (supported() ? Notification.permission : 'unsupported')

export async function swReg() {
  if (!('serviceWorker' in navigator)) return null
  return (await navigator.serviceWorker.getRegistration('/')) || navigator.serviceWorker.register(SW_URL)
}

// Loud alert sound (Web Audio) — three rising chimes
let ctx
export function ring() {
  if (!soundOn()) return
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    const t0 = ctx.currentTime
    ;[0, 0.35, 0.7, 1.2, 1.55, 1.9].forEach((dt, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.type = 'triangle'
      o.frequency.value = [880, 1175, 1568][i % 3]
      g.gain.setValueAtTime(0.0001, t0 + dt)
      g.gain.exponentialRampToValueAtTime(0.9, t0 + dt + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + 0.32)
      o.connect(g).connect(ctx.destination)
      o.start(t0 + dt); o.stop(t0 + dt + 0.34)
    })
    navigator.vibrate?.([300, 100, 300, 100, 600])
  } catch { /* ignore */ }
}

// System notification from the admin page (works while any admin tab is open, even in background)
export async function showLocal({ title, body, tag, url = '/admin' }) {
  if (permission() !== 'granted') return
  const opts = { body, tag, renotify: true, requireInteraction: true, icon: '/icon-192.png', badge: '/icon-192.png', vibrate: [300, 100, 300, 100, 600], data: { url } }
  try { const r = await swReg(); if (r) return r.showNotification(title, opts) } catch { /* fall back */ }
  try { new Notification(title, opts) } catch { /* ignore */ }
}

// Ask permission + (if a Web Push key is set) register this device for push even when the browser is closed
export async function enableOnThisDevice(vapidKey, username) {
  if (!supported()) throw new Error('Browser-kan notifications ma taageero. iPhone: marka hore Share → "Add to Home Screen", kadib ka fur icon-ka.')
  const p = await Notification.requestPermission()
  if (p !== 'granted') throw new Error('Notifications waa la diiday. Browser settings → Site settings → Notifications → Allow.')
  const reg = await swReg()
  ring()
  if (!vapidKey) return { push: false }
  if (!(await isSupported())) return { push: false }
  const token = await getToken(getMessaging(app), { vapidKey, serviceWorkerRegistration: reg })
  if (!token) return { push: false }
  await setDoc(doc(db, TOKENS, token), { username: username || '', ua: navigator.userAgent.slice(0, 180), createdAt: serverTimestamp() })
  try { localStorage.setItem('dmp-push-token', token) } catch { /* ignore */ }
  return { push: true, token }
}

export const myToken = () => { try { return localStorage.getItem('dmp-push-token') } catch { return null } }
export const removeToken = (t) => deleteDoc(doc(db, TOKENS, t))
