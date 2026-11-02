import { useEffect, useMemo, useState } from 'react'
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { COL } from '../data/seed'
import { dayKey } from '../hooks/useTrack'

const RANGES = [[7, '7 maalmood'], [30, '30 maalmood'], [90, '90 maalmood']]
const SOURCES = { direct: 'Toos (Direct)', tiktok: 'TikTok', facebook: 'Facebook', x: 'X (Twitter)', instagram: 'Instagram', youtube: 'YouTube', whatsapp: 'WhatsApp', google: 'Google', other: 'Kale' }
const fmt = (n) => (n || 0).toLocaleString()
const daysAgo = (n) => dayKey(new Date(Date.now() - n * 864e5))
const label = (k) => { const [, m, d] = k.split('-'); return `${+d}/${+m}` }

// Live visitor numbers for the dashboard cards
export function useTodayStats() {
  const [s, setS] = useState({ today: null, total: null })
  useEffect(() => {
    const a = onSnapshot(doc(db, COL.stats, `day-${dayKey()}`), (d) => setS((x) => ({ ...x, today: d.data() || {} })), () => {})
    const b = onSnapshot(doc(db, COL.stats, 'total'), (d) => setS((x) => ({ ...x, total: d.data() || {} })), () => {})
    return () => { a(); b() }
  }, [])
  return s
}

export default function Analytics() {
  const [range, setRange] = useState(30)
  const [rows, setRows] = useState({})
  const [total, setTotal] = useState({})
  const [err, setErr] = useState('')
  const [hover, setHover] = useState(null)

  useEffect(() => {
    const q = query(collection(db, COL.stats), where('date', '>=', daysAgo(89)))
    const a = onSnapshot(q, (s) => setRows(Object.fromEntries(s.docs.map((d) => [d.data().date, d.data()]))), (e) => setErr(e.message))
    const b = onSnapshot(doc(db, COL.stats, 'total'), (d) => setTotal(d.data() || {}), () => {})
    return () => { a(); b() }
  }, [])

  const days = useMemo(() => Array.from({ length: range }, (_, i) => {
    const k = daysAgo(range - 1 - i); const r = rows[k] || {}
    return { k, visitors: r.visitors || 0, visits: r.visits || 0, pageviews: r.pageviews || 0 }
  }), [rows, range])

  const sum = (key) => days.reduce((t, d) => t + d[key], 0)
  const today = rows[dayKey()] || {}
  const yesterday = rows[daysAgo(1)] || {}
  const max = Math.max(1, ...days.map((d) => d.visitors))
  const ticks = [max, Math.round(max / 2), 0]

  const agg = (field) => {
    const out = {}
    Object.entries(rows).forEach(([k, r]) => { if (k >= days[0].k) Object.entries(r[field] || {}).forEach(([n, v]) => (out[n] = (out[n] || 0) + v)) })
    return Object.entries(out).sort((a, b) => b[1] - a[1])
  }
  const sources = agg('sources')
  const srcTotal = sources.reduce((t, [, v]) => t + v, 0) || 1
  const mob = days.reduce((t, d) => t + (rows[d.k]?.mobile || 0), 0)
  const desk = days.reduce((t, d) => t + (rows[d.k]?.desktop || 0), 0)
  const pages = agg('pages')

  const diff = (a = 0, b = 0) => {
    if (!b) return null
    const p = Math.round(((a - b) / b) * 100)
    return <em className={p >= 0 ? 'up' : 'down'}>{p >= 0 ? '▲' : '▼'} {Math.abs(p)}% shalay</em>
  }

  return (
    <div className="an">
      <div className="adm-pagehead">
        <div><h2>Booqdayaasha website-ka</h2><p>Live — tirooyinku isla markiiba way isbeddelaan. Admin-ka lama tiriyo.</p></div>
        <div className="an-range">{RANGES.map(([n, l]) => <button key={n} className={range === n ? 'is-on' : ''} onClick={() => setRange(n)}>{l}</button>)}</div>
      </div>
      {err && <p className="err">{err.includes('permission') ? 'Firestore rules: ku dar qaybta dreamStats ee firestore.rules → Publish.' : err}</p>}

      <div className="an-tiles">
        <div className="an-tile an-tile--hero"><small>Booqdayaal maanta</small><strong>{fmt(today.visitors)}</strong>{diff(today.visitors, yesterday.visitors)}</div>
        <div className="an-tile"><small>Jeer la soo galay maanta</small><strong>{fmt(today.visits)}</strong><span>{fmt(today.pageviews)} bog la furay</span></div>
        <div className="an-tile"><small>Booqdayaal · {range} maalmood</small><strong>{fmt(sum('visitors'))}</strong><span>{fmt(sum('visits'))} jeer la soo galay</span></div>
        <div className="an-tile"><small>Wadarta guud (abid)</small><strong>{fmt(total.visits)}</strong><span>jeer la soo galay · {fmt(total.visitors)} booqde</span></div>
      </div>

      <div className="adm-card an-chartcard">
        <div className="an-charthead"><h3>Booqdayaasha maalin kasta</h3><span className="muted">{label(days[0].k)} – {label(days[days.length - 1].k)}</span></div>
        <div className="an-chart" onMouseLeave={() => setHover(null)}>
          <div className="an-y">{ticks.map((t, i) => <span key={i}>{fmt(t)}</span>)}</div>
          <div className="an-plot">
            {[0, 1, 2].map((i) => <i key={i} className="an-grid" style={{ top: `${i * 50}%` }} />)}
            <div className="an-bars" style={{ gap: range > 30 ? 1 : 2 }}>
              {days.map((d, i) => (
                <div key={d.k} className={`an-col ${hover === i ? 'is-hover' : ''}`} onMouseEnter={() => setHover(i)} onClick={() => setHover(i)}>
                  <b style={{ height: `${(d.visitors / max) * 100}%` }} className={d.k === dayKey() ? 'is-today' : ''} />
                </div>
              ))}
            </div>
            {hover !== null && (
              <div className="an-tip" style={{ left: `${((hover + 0.5) / days.length) * 100}%` }}>
                <b>{label(days[hover].k)}{days[hover].k === dayKey() ? ' · Maanta' : ''}</b>
                <span><i />{fmt(days[hover].visitors)} booqde</span>
                <span>{fmt(days[hover].visits)} jeer · {fmt(days[hover].pageviews)} bog</span>
              </div>
            )}
          </div>
          <div className="an-x">
            {days.map((d, i) => <span key={d.k}>{(i % Math.ceil(days.length / 7) === 0 || i === days.length - 1) ? label(d.k) : ''}</span>)}
          </div>
        </div>
      </div>

      <div className="an-split">
        <div className="adm-card">
          <h3>Halka ay ka yimaadeen</h3>
          {sources.length === 0 && <p className="muted">Weli xog ma jirto.</p>}
          {sources.map(([k, v]) => (
            <div key={k} className="an-row">
              <span>{SOURCES[k] || k}</span>
              <div className="an-meter"><i style={{ width: `${(v / srcTotal) * 100}%` }} /></div>
              <b>{fmt(v)}</b><small>{Math.round((v / srcTotal) * 100)}%</small>
            </div>
          ))}
        </div>
        <div className="adm-card">
          <h3>Qalabka</h3>
          {[['📱 Mobile', mob], ['💻 Laptop / Desktop', desk]].map(([l, v]) => (
            <div key={l} className="an-row"><span>{l}</span><div className="an-meter"><i style={{ width: `${(v / (mob + desk || 1)) * 100}%` }} /></div><b>{fmt(v)}</b><small>{Math.round((v / (mob + desk || 1)) * 100)}%</small></div>
          ))}
          <h3 style={{ marginTop: 22 }}>Bogagga</h3>
          {pages.map(([k, v]) => <div key={k} className="an-row"><span>{k === 'home' ? 'Bogga hore' : k === 'sponsor' ? '/sponsor' : k}</span><div className="an-meter"><i style={{ width: `${(v / (pages[0][1] || 1)) * 100}%` }} /></div><b>{fmt(v)}</b><small /></div>)}
        </div>
      </div>

      <div className="adm-card">
        <h3>Shaxda maalmaha</h3>
        <div className="an-tablewrap">
          <table className="an-table">
            <thead><tr><th>Taariikh</th><th>Booqdayaal</th><th>Jeer la soo galay</th><th>Bogag</th></tr></thead>
            <tbody>
              {[...days].reverse().filter((d) => d.visits || d.visitors || d.k === dayKey()).map((d) => (
                <tr key={d.k} className={d.k === dayKey() ? 'is-today' : ''}><td>{d.k}{d.k === dayKey() ? ' (maanta)' : ''}</td><td>{fmt(d.visitors)}</td><td>{fmt(d.visits)}</td><td>{fmt(d.pageviews)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
