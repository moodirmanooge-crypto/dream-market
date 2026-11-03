import { useEffect, useRef, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { COL } from '../data/seed'
import { ring, showLocal } from './notify'

// Everything the admin is alerted about (same tags as the Cloud Function, so a device never shows doubles)
export const SOURCES = [
  { key: 'regs', col: COL.regs, tab: 'competitions', tag: 'reg-', title: () => '🏆 New competition registration', body: (d) => `${d.fullName || ''}${d.country ? ` (${d.country})` : ''} joined ${d.compName || 'a competition'}` },
  { key: 'messages', col: COL.messages, tab: 'messages', tag: 'msg-', title: (d) => (d.type === 'Sponsorship' ? '💼 New sponsorship request' : '✉️ New message'), body: (d) => `${d.name || ''}: ${String(d.message || '').slice(0, 90)}` },
  { key: 'subscribers', col: COL.subscribers, tab: 'subscribers', tag: 'sub-', title: () => '📬 New newsletter signup', body: (d) => `${d.name ? d.name + ' — ' : ''}${d.email || ''}` },
]

export function useAdminAlerts(active) {
  const [alerts, setAlerts] = useState([])
  const [unread, setUnread] = useState(0)
  const [toasts, setToasts] = useState([])
  const seen = useRef(new Set())

  useEffect(() => {
    if (!active) return
    const unsubs = SOURCES.map((src) => {
      let first = true
      return onSnapshot(query(collection(db, src.col), orderBy('createdAt', 'desc'), limit(15)), (snap) => {
        if (first) { snap.docs.forEach((d) => seen.current.add(src.tag + d.id)); first = false; return }
        snap.docChanges().forEach((ch) => {
          const id = src.tag + ch.doc.id
          if (ch.type !== 'added' || seen.current.has(id)) return
          seen.current.add(id)
          const d = ch.doc.data()
          const a = { id, title: src.title(d), body: src.body(d), tab: src.tab, at: Date.now() }
          setAlerts((x) => [a, ...x].slice(0, 30))
          setUnread((n) => n + 1)
          setToasts((x) => [...x, a])
          setTimeout(() => setToasts((x) => x.filter((t) => t.id !== id)), 9000)
          ring()
          showLocal({ title: a.title, body: a.body, tag: id, url: `/admin?tab=${src.tab}` })
        })
      }, () => {})
    })
    return () => unsubs.forEach((u) => u())
  }, [active])

  useEffect(() => {
    const base = 'Admin | Dream Market Podcast'
    document.title = unread ? `(${unread}) ${base}` : base
  }, [unread])

  return { alerts, unread, clearUnread: () => setUnread(0), toasts, dismiss: (id) => setToasts((x) => x.filter((t) => t.id !== id)) }
}
