import { useEffect } from 'react'
import { doc, increment, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { COL } from '../data/seed'

// Day key in Somalia time (UTC+3) so "today" matches the admin's clock
export const dayKey = (d = new Date()) => new Date(d.getTime() + 3 * 3600e3).toISOString().slice(0, 10)

const safe = (fn, fallback = null) => { try { return fn() } catch { return fallback } }

function source() {
  const r = (document.referrer || '').toLowerCase()
  const utm = new URLSearchParams(location.search).get('utm_source')?.toLowerCase() || ''
  const s = utm || r
  if (!s || r.includes(location.hostname)) return 'direct'
  if (s.includes('tiktok')) return 'tiktok'
  if (s.includes('facebook') || s.includes('fb.')) return 'facebook'
  if (s.includes('t.co') || s.includes('twitter') || s.includes('x.com')) return 'x'
  if (s.includes('instagram')) return 'instagram'
  if (s.includes('youtube')) return 'youtube'
  if (s.includes('whatsapp')) return 'whatsapp'
  if (s.includes('google') || s.includes('bing')) return 'google'
  return 'other'
}

/*
  Counts website traffic into Firestore "dreamStats":
   - visitors  = different people per day (one browser counted once per day)
   - visits    = times the website was opened (once per browser session)
   - pageviews = every page opened
  Docs: dreamStats/day-YYYY-MM-DD and dreamStats/total
*/
export function useTrack(page) {
  useEffect(() => {
    if (navigator.webdriver || /bot|crawl|spider|preview/i.test(navigator.userAgent)) return
    const today = dayKey()
    const newVisitor = safe(() => localStorage.getItem('dmp-day') !== today, true)
    const newVisit = safe(() => !sessionStorage.getItem('dmp-visit'), true)
    safe(() => { localStorage.setItem('dmp-day', today); sessionStorage.setItem('dmp-visit', '1') })

    const inc = { pageviews: increment(1), pages: { [page]: increment(1) } }
    if (newVisit) {
      inc.visits = increment(1)
      inc.sources = { [source()]: increment(1) }
      inc[window.matchMedia('(max-width: 900px)').matches ? 'mobile' : 'desktop'] = increment(1)
    }
    if (newVisitor) inc.visitors = increment(1)

    const day = { ...inc, date: today, updatedAt: serverTimestamp() }
    const total = { pageviews: increment(1), updatedAt: serverTimestamp() }
    if (newVisit) total.visits = increment(1)
    if (newVisitor) total.visitors = increment(1)

    setDoc(doc(db, COL.stats, `day-${today}`), day, { merge: true }).catch(() => {})
    setDoc(doc(db, COL.stats, 'total'), total, { merge: true }).catch(() => {})
  }, [page])
}
