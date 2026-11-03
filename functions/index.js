/*
  Dream Market Podcast — sends push notifications to every admin device
  (laptop, tablet, mobile) when something new happens, even if the browser is closed.

  Deploy (one time):   npm install -g firebase-tools
                       firebase login
                       cd functions && npm install && cd ..
                       firebase deploy --only functions
*/
const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { setGlobalOptions } = require('firebase-functions/v2')
const admin = require('firebase-admin')

// ⚠️ Must match your Firestore location (Firebase Console → Firestore → top of the page).
//    e.g. 'us-central1', 'europe-west1', 'me-central1' … ('nam5' → 'us-central1', 'eur3' → 'europe-west1')
const REGION = 'us-central1'
const SITE = 'https://dreammarketpodcast.com'

setGlobalOptions({ region: REGION, maxInstances: 5 })
admin.initializeApp()

async function notifyAdmins({ title, body, tag, tab }) {
  const db = admin.firestore()
  const snap = await db.collection('dreamAdminTokens').get()
  const tokens = snap.docs.map((d) => d.id)
  if (!tokens.length) return
  const link = `${SITE}/admin?tab=${tab}`
  const res = await admin.messaging().sendEachForMulticast({
    tokens,
    data: { title, body, tag, url: link },
    webpush: {
      headers: { Urgency: 'high', TTL: '86400' },
      notification: {
        title, body, tag, renotify: true, requireInteraction: true,
        icon: `${SITE}/icon-192.png`, badge: `${SITE}/icon-192.png`, vibrate: [300, 100, 300, 100, 600],
      },
      fcmOptions: { link },
    },
  })
  // remove devices that are no longer valid
  const dead = []
  res.responses.forEach((r, i) => {
    const code = r.error && r.error.code
    if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token' || code === 'messaging/invalid-argument') dead.push(tokens[i])
  })
  await Promise.all(dead.map((t) => db.collection('dreamAdminTokens').doc(t).delete()))
}

exports.dmpNewRegistration = onDocumentCreated('dreamCompRegs/{id}', (e) => {
  const d = e.data ? e.data.data() : {}
  return notifyAdmins({
    title: '🏆 New competition registration',
    body: `${d.fullName || ''}${d.country ? ` (${d.country})` : ''} joined ${d.compName || 'a competition'}`,
    tag: `reg-${e.params.id}`, tab: 'competitions',
  })
})

exports.dmpNewMessage = onDocumentCreated('dreamMessages/{id}', (e) => {
  const d = e.data ? e.data.data() : {}
  return notifyAdmins({
    title: d.type === 'Sponsorship' ? '💼 New sponsorship request' : '✉️ New message',
    body: `${d.name || ''}: ${String(d.message || '').slice(0, 90)}`,
    tag: `msg-${e.params.id}`, tab: 'messages',
  })
})

exports.dmpNewSubscriber = onDocumentCreated('dreamSubscribers/{id}', (e) => {
  const d = e.data ? e.data.data() : {}
  return notifyAdmins({
    title: '📬 New newsletter signup',
    body: `${d.name ? d.name + ' — ' : ''}${d.email || ''}`,
    tag: `sub-${e.params.id}`, tab: 'subscribers',
  })
})
