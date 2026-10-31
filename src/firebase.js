// Firebase — project: barakaat-a9fe1
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyAtjD-bDtA36ijj5whyYClexnFBM1COTw0',
  authDomain: 'barakaat-a9fe1.firebaseapp.com',
  databaseURL: 'https://barakaat-a9fe1-default-rtdb.firebaseio.com',
  projectId: 'barakaat-a9fe1',
  storageBucket: 'barakaat-a9fe1.firebasestorage.app',
  messagingSenderId: '993046978374',
  appId: '1:993046978374:web:59740551641614a4ae0f47',
  measurementId: 'G-SRW7JS4X89',
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
isSupported().then((ok) => ok && getAnalytics(app)).catch(() => {})
