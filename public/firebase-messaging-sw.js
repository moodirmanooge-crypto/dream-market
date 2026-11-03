/* Dream Market Podcast — admin notifications service worker.
   Receives Web Push (Firebase Cloud Messaging) even when the website / browser tab is closed. */
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyAtjD-bDtA36ijj5whyYClexnFBM1COTw0',
  authDomain: 'barakaat-a9fe1.firebaseapp.com',
  projectId: 'barakaat-a9fe1',
  storageBucket: 'barakaat-a9fe1.firebasestorage.app',
  messagingSenderId: '993046978374',
  appId: '1:993046978374:web:59740551641614a4ae0f47',
})
// Push messages that carry a "notification" are displayed automatically by the SDK.
firebase.messaging()

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

// Clicks on notifications shown by the admin page itself (FCM handles its own clicks)
self.addEventListener('notificationclick', (e) => {
  const data = e.notification.data || {}
  if (data.FCM_MSG) return
  e.notification.close()
  const url = data.url || '/admin'
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const open = all.find((c) => c.url.includes('/admin'))
    if (open) { await open.focus(); open.navigate?.(url) } else await self.clients.openWindow(url)
  })())
})
