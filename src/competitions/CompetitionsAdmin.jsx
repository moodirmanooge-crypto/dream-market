import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { COL, seed } from '../data/seed'
import { Field, ValueEditor } from '../admin/fields'
import { compState, fmtDate, money, pctFmt, rankBoard } from './util'
import { StatusPill } from './CompCard'

const TYPES = ['Monthly', 'Sponsored', 'Championship']
const BLANK = {
  name: '', type: 'Monthly', description: '', organizer: 'Dream Market Podcast', sponsor: '', sponsorLogo: '', sponsorLink: '', banner: '',
  start: '', end: '', regDeadline: '', entryFee: 'Free', maxParticipants: 100, mode: 'Demo', platform: 'MT5', accountSize: '$10,000', prizePool: '',
  howToJoin: seed.competitions[0].howToJoin, rules: seed.competitions[0].rules, prizes: seed.competitions[0].prizes, winners: [],
  registrationOpen: true, featured: false, hidden: false,
}
const PRIZE_TPL = [{ place: '', prize: '' }]
const WINNER_TPL = [{ place: '', name: '', country: '', result: '', prize: '', photo: '', certificate: '' }]
let imported = false

export default function CompetitionsAdmin() {
  const [comps, setComps] = useState([])
  const [view, setView] = useState({ mode: 'list' })
  const [err, setErr] = useState('')

  useEffect(() => onSnapshot(collection(db, COL.competitions), async (s) => {
    setComps(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => String(b.start).localeCompare(String(a.start))))
    if (imported) return
    imported = true
    try { // first open: copy the sample competition so the admin can edit it
      const site = await getDoc(doc(db, COL.settings, 'site'))
      if (site.data()?.seeded?.competitions) return
      if (s.empty) { const { id, ...sample } = seed.competitions[0]; await addDoc(collection(db, COL.competitions), { ...sample, registrationOpen: false, createdAt: serverTimestamp() }) }
      await setDoc(doc(db, COL.settings, 'site'), { seeded: { competitions: true } }, { merge: true })
    } catch (e) { setErr(e.message) }
  }, (e) => setErr(e.message)), [])

  const live = view.comp && comps.find((c) => c.id === view.comp.id)
  return (
    <div>
      {err && <p className="err" onClick={() => setErr('')}>{err} ✕</p>}
      {view.mode === 'list' && <List comps={comps} setView={setView} setErr={setErr} />}
      {view.mode === 'edit' && <Editor comp={view.comp} onDone={() => setView({ mode: 'list' })} setErr={setErr} />}
      {view.mode === 'regs' && live && <Participants comp={live} back={() => setView({ mode: 'list' })} toBoard={() => setView({ mode: 'board', comp: live })} />}
      {view.mode === 'board' && live && <Board comp={live} back={() => setView({ mode: 'list' })} toRegs={() => setView({ mode: 'regs', comp: live })} />}
    </div>
  )
}

function List({ comps, setView, setErr }) {
  const toggle = (c) => updateDoc(doc(db, COL.competitions, c.id), { registrationOpen: !c.registrationOpen }).catch((e) => setErr(e.message))
  const remove = async (c) => {
    if (!confirm(`Tirtir "${c.name}"? Dhammaan diiwaangelinta iyo leaderboard-ka tartankan waa la tirtirayaa.`)) return
    try {
      const b = writeBatch(db)
      for (const col of [COL.regs, COL.board]) (await getDocs(query(collection(db, col), where('compId', '==', c.id)))).forEach((d) => b.delete(d.ref))
      b.delete(doc(db, COL.competitions, c.id))
      await b.commit()
    } catch (e) { setErr(e.message) }
  }
  return (
    <>
      <div className="adm-pagehead">
        <div><h2>Competitions <small>({comps.length})</small></h2><p>Samee tartan, maamul isdiiwaangelinta, leaderboard-ka iyo guuleystayaasha.</p></div>
        <button className="btn btn--gold" onClick={() => setView({ mode: 'edit', comp: null })}>+ Competition cusub</button>
      </div>
      {comps.length === 0 && <div className="adm-card adm-empty">Weli tartan ma jiro. Riix "+ Competition cusub".</div>}
      <div className="adm-items">
        {comps.map((c) => {
          const st = compState(c)
          return (
            <div key={c.id} className={`adm-item ca-item ${c.hidden ? 'is-hidden' : ''}`}>
              <div className="adm-item__thumb">{c.banner ? <img src={c.banner} alt="" /> : <span>🏆</span>}</div>
              <div className="adm-item__info">
                <b>{c.name}</b>
                <small>{c.type} · {fmtDate(c.start)} – {fmtDate(c.end)} · {c.prizePool || '—'}</small>
                <div className="adm-tags">
                  <StatusPill st={st} />
                  <em>👥 {c.registered || 0}{st.max ? ` / ${st.max}` : ''}</em>
                  {c.featured && <em>⭐ Featured</em>}{c.hidden && <em className="off">🙈 Qarsoon</em>}
                  <em className={c.registrationOpen ? '' : 'off'}>{c.registrationOpen ? '🟢 Registration: ON' : '🔴 Registration: OFF'}</em>
                </div>
              </div>
              <div className="adm-item__btns">
                <button onClick={() => setView({ mode: 'regs', comp: c })}>👥 Participants</button>
                <button onClick={() => setView({ mode: 'board', comp: c })}>📊 Leaderboard</button>
                <button onClick={() => toggle(c)}>{c.registrationOpen ? 'Xir registration' : 'Fur registration'}</button>
                <button onClick={() => setView({ mode: 'edit', comp: c })}>Edit</button>
                <a className="adm-linkbtn" href={`/competitions/${c.id}`} target="_blank" rel="noreferrer">↗</a>
                <button className="danger" onClick={() => remove(c)}>✕</button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function Editor({ comp, onDone, setErr }) {
  const [f, setF] = useState(() => ({ ...BLANK, ...(comp || {}) }))
  const [busy, setBusy] = useState(false)
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }))
  const F = (k, type, label, hint, extra = {}) => <Field label={label} hint={hint} type={type} value={f[k]} onChange={set(k)} folder="competitions" {...extra} />

  const save = async (e) => {
    e.preventDefault()
    if (!f.name.trim()) return setErr('Magaca tartanka waa qasab.')
    setBusy(true)
    const { id, createdAt, ...data } = f
    data.maxParticipants = Number(data.maxParticipants) || 0
    data.registered = Number(data.registered) || 0
    try {
      if (data.featured) {
        const all = await getDocs(collection(db, COL.competitions))
        const b = writeBatch(db); all.forEach((d) => d.id !== id && d.data().featured && b.update(d.ref, { featured: false })); await b.commit()
      }
      if (id) await updateDoc(doc(db, COL.competitions, id), { ...data, updatedAt: serverTimestamp() })
      else await addDoc(collection(db, COL.competitions), { ...data, createdAt: serverTimestamp() })
      onDone()
    } catch (e2) { setErr(e2.message) }
    setBusy(false)
  }

  return (
    <form onSubmit={save} className="ca-form">
      <div className="adm-pagehead">
        <div><h2>{comp ? 'Wax ka beddel tartanka' : 'Competition cusub'}</h2><p>Taariikhaha waxaa lagu qoraa saacadda Soomaaliya.</p></div>
        <div className="admin__actions"><button type="button" className="btn btn--ghost" onClick={onDone}>← Ku noqo</button><button className="btn btn--gold" disabled={busy}>{busy ? 'Kaydinaya…' : '💾 Kaydi'}</button></div>
      </div>

      <div className="adm-card"><h3>1. Macluumaadka guud</h3>
        <div className="ca-grid">
          {F('name', 'text', 'Competition Name *')}
          {F('type', 'select', 'Competition Type', 'Monthly / Sponsored / Championship', { options: TYPES })}
        </div>
        {F('description', 'textarea', 'Description')}
        {F('banner', 'image', 'Banner / sawirka tartanka')}
        <div className="ca-checks">{F('registrationOpen', 'checkbox', '🟢 Registration-ku waa furan yahay')}{F('featured', 'checkbox', '⭐ Featured (bogga hore ugu horreeya)')}{F('hidden', 'checkbox', '🙈 Qari')}</div>
      </div>

      <div className="adm-card"><h3>2. Organizer & Sponsor</h3>
        <div className="ca-grid">{F('organizer', 'text', 'Organizer')}{F('sponsor', 'text', 'Sponsor (prop firm)')}{F('sponsorLink', 'url', 'Sponsor link')}</div>
        {F('sponsorLogo', 'image', 'Sponsor logo')}
      </div>

      <div className="adm-card"><h3>3. Taariikhaha & xadka</h3>
        <div className="ca-grid">
          {F('start', 'datetime', 'Start Date')}{F('end', 'datetime', 'End Date')}{F('regDeadline', 'datetime', 'Registration Deadline')}
          {F('entryFee', 'text', 'Entry Fee', 'Free ama $20')}{F('maxParticipants', 'number', 'Maximum Participants', '0 = xad la\'aan')}
          {F('mode', 'select', 'Demo / Live', '', { options: ['Demo', 'Live'] })}
          {F('platform', 'text', 'Trading Platform', 'MT5, MT4, cTrader')}{F('accountSize', 'text', 'Account Size', '$5K, $10K…')}{F('prizePool', 'text', 'Prize Pool', '$15,000')}
        </div>
      </div>

      <div className="adm-card"><h3>4. How to Join & Rules</h3><p className="muted">Sadar kasta = hal tallaabo / hal shuruud.</p>
        {F('howToJoin', 'textarea', 'How to Join', '', { rows: 5 })}
        {F('rules', 'textarea', 'Rules & Requirements', '', { rows: 7 })}
      </div>

      <div className="adm-card"><h3>5. Prizes</h3><ValueEditor k="prizes" value={f.prizes || []} template={PRIZE_TPL} onChange={set('prizes')} folder="competitions" /></div>
      <div className="adm-card"><h3>6. Winners</h3><p className="muted">Ku dar marka tartanku dhammaado — sawirka iyo shahaadada (PDF ama sawir) waad upload garayn kartaa.</p>
        <ValueEditor k="winners" value={f.winners || []} template={WINNER_TPL} onChange={set('winners')} folder="winners" /></div>

      <div className="adm-savebar"><button className="btn btn--gold btn--lg" disabled={busy}>💾 Kaydi tartanka</button></div>
    </form>
  )
}

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`

function Participants({ comp, back, toBoard }) {
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [board, setBoard] = useState([])
  const [err, setErr] = useState('')
  useEffect(() => onSnapshot(query(collection(db, COL.regs), where('compId', '==', comp.id)),
    (s) => setRows(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))), (e) => setErr(e.message)), [comp.id])
  useEffect(() => onSnapshot(query(collection(db, COL.board), where('compId', '==', comp.id)), (s) => setBoard(s.docs.map((d) => d.data().regId)), () => {}), [comp.id])

  const counts = { all: rows.length, pending: 0, approved: 0, rejected: 0 }
  rows.forEach((r) => (counts[r.status] = (counts[r.status] || 0) + 1))
  const shown = rows.filter((r) => (filter === 'all' || r.status === filter) && (!q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase())))

  const setStatus = (r, status) => updateDoc(doc(db, COL.regs, r.id), { status, reviewedAt: serverTimestamp() }).catch((e) => setErr(e.message))
  const remove = async (r) => {
    if (!confirm(`Tirtir ${r.fullName}?`)) return
    try { const b = writeBatch(db); b.delete(doc(db, COL.regs, r.id)); b.update(doc(db, COL.competitions, comp.id), { registered: increment(-1) }); await b.commit() } catch (e) { setErr(e.message) }
  }
  const toLeaderboard = (r) => addDoc(collection(db, COL.board), {
    compId: comp.id, regId: r.id, name: r.fullName, country: r.country || '', startBalance: Number(String(comp.accountSize).replace(/[^0-9.]/g, '')) || 10000,
    currentBalance: Number(String(comp.accountSize).replace(/[^0-9.]/g, '')) || 10000, trades: 0, updatedAt: serverTimestamp(),
  }).catch((e) => setErr(e.message))
  const csv = () => {
    const head = ['Full name', 'Email', 'Country', 'WhatsApp', 'Telegram', 'X', 'Experience', 'Platform', 'Account ID', 'Status', 'Registered']
    const body = rows.map((r) => [r.fullName, r.email, r.country, r.whatsapp, r.telegram, r.xUsername, r.experience, r.platform, r.accountId, r.status, r.createdAt?.toDate?.().toLocaleString() || ''].map(csvCell).join(','))
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + head.join(',') + '\n' + body.join('\n')], { type: 'text/csv' }))
    a.download = `${comp.name.replace(/\W+/g, '-')}-participants.csv`; a.click()
  }
  const wa = (n = '') => `https://wa.me/${n.replace(/[^0-9]/g, '')}`

  return (
    <div>
      <div className="adm-pagehead">
        <div><button className="ca-back" onClick={back}>← Competitions</button><h2>👥 Participants <small>({rows.length})</small></h2><p>{comp.name}</p></div>
        <div className="admin__actions"><button className="btn btn--ghost" onClick={toBoard}>📊 Leaderboard</button>{rows.length > 0 && <button className="btn btn--ghost" onClick={csv}>⬇ Export CSV</button>}</div>
      </div>
      {err && <p className="err">{err}</p>}
      <div className="ca-toolbar">
        <div className="chips">{['all', 'pending', 'approved', 'rejected'].map((k) => <button key={k} className={filter === k ? 'is-on' : ''} onClick={() => setFilter(k)}>{{ all: 'Dhammaan', pending: '⏳ Sugaya', approved: '✅ La oggolaaday', rejected: '❌ La diiday' }[k]} ({counts[k] || 0})</button>)}</div>
        <input className="ca-search" placeholder="🔍 Raadi magac, email, waddan…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {shown.length === 0 && <div className="adm-card adm-empty">Qof ma jiro.</div>}
      <div className="adm-items">
        {shown.map((r) => (
          <div key={r.id} className={`ca-reg ca-reg--${r.status}`}>
            <div className="ca-reg__top">
              <b>{r.fullName}</b><span className={`ca-status ca-status--${r.status}`}>{r.status}</span>
              <small>{r.createdAt?.toDate?.().toLocaleString() || ''}</small>
            </div>
            <div className="ca-reg__meta">
              <a href={`mailto:${r.email}`}>✉ {r.email}</a>
              {r.whatsapp && <a href={wa(r.whatsapp)} target="_blank" rel="noreferrer">💬 {r.whatsapp}</a>}
              {r.telegram && <span>✈ {r.telegram}</span>}{r.xUsername && <span>𝕏 {r.xUsername}</span>}
              <span>🌍 {r.country}</span><span>📈 {r.experience}</span><span>🖥 {r.platform}</span>{r.accountId && <span>#️⃣ {r.accountId}</span>}
            </div>
            <div className="adm-item__btns">
              {r.status !== 'approved' && <button onClick={() => setStatus(r, 'approved')}>✅ Oggolow</button>}
              {r.status !== 'rejected' && <button onClick={() => setStatus(r, 'rejected')}>❌ Diid</button>}
              {r.status === 'approved' && !board.includes(r.id) && <button onClick={() => toLeaderboard(r)}>📊 Ku dar leaderboard</button>}
              {board.includes(r.id) && <em className="ca-onboard">📊 Leaderboard-ka ku jira</em>}
              <button className="danger" onClick={() => remove(r)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Board({ comp, back, toRegs }) {
  const [rows, setRows] = useState([])
  const [edit, setEdit] = useState({})
  const [err, setErr] = useState('')
  const [nw, setNw] = useState({ name: '', country: '', startBalance: '', currentBalance: '', trades: '' })
  useEffect(() => onSnapshot(query(collection(db, COL.board), where('compId', '==', comp.id)), (s) => setRows(s.docs.map((d) => ({ id: d.id, ...d.data() }))), (e) => setErr(e.message)), [comp.id])
  const ranked = useMemo(() => rankBoard(rows.map((r) => ({ ...r, ...(edit[r.id] || {}) }))), [rows, edit])
  const dirty = Object.keys(edit).length

  const change = (id, k, v) => setEdit((e) => ({ ...e, [id]: { ...(e[id] || {}), [k]: v } }))
  const num = (v) => (v === '' || v == null ? 0 : Number(v))
  const saveAll = async () => {
    try {
      const b = writeBatch(db)
      Object.entries(edit).forEach(([id, d]) => {
        const out = { ...d, updatedAt: serverTimestamp() }
        ;['startBalance', 'currentBalance', 'trades'].forEach((k) => k in out && (out[k] = num(out[k])))
        b.update(doc(db, COL.board, id), out)
      })
      await b.commit(); setEdit({})
    } catch (e) { setErr(e.message) }
  }
  const add = async (e) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, COL.board), { compId: comp.id, name: nw.name.trim(), country: nw.country.trim(), startBalance: num(nw.startBalance), currentBalance: num(nw.currentBalance || nw.startBalance), trades: num(nw.trades), updatedAt: serverTimestamp() })
      setNw({ name: '', country: '', startBalance: '', currentBalance: '', trades: '' })
    } catch (e2) { setErr(e2.message) }
  }
  const del = (r) => confirm(`Ka saar ${r.name} leaderboard-ka?`) && deleteDoc(doc(db, COL.board, r.id)).catch((e) => setErr(e.message))
  const val = (r, k) => (edit[r.id] && k in edit[r.id] ? edit[r.id][k] : r[k] ?? '')

  return (
    <div>
      <div className="adm-pagehead">
        <div><button className="ca-back" onClick={back}>← Competitions</button><h2>📊 Leaderboard <small>({rows.length})</small></h2><p>{comp.name} — geli balance-ka; profit % iyo rank si toos ah ayaa loo xisaabiyaa. Website-ka isla markiiba wuu isbeddelaa.</p></div>
        <div className="admin__actions"><button className="btn btn--ghost" onClick={toRegs}>👥 Participants</button>
          <button className="btn btn--gold" onClick={saveAll} disabled={!dirty}>💾 Kaydi {dirty ? `(${dirty})` : ''}</button></div>
      </div>
      {err && <p className="err" onClick={() => setErr('')}>{err} ✕</p>}
      <div className="adm-card lb-admin-wrap">
        <table className="lb lb--admin">
          <thead><tr><th>#</th><th>Trader</th><th>Country</th><th>Start $</th><th>Current $</th><th>Trades</th><th>Profit</th><th>DQ</th><th /></tr></thead>
          <tbody>
            {ranked.map((r, i) => (
              <tr key={r.id} className={edit[r.id] ? 'is-dirty' : r.disqualified ? 'is-dq' : ''}>
                <td><b>{r.disqualified ? 'DQ' : i + 1}</b></td>
                <td><input value={val(r, 'name')} onChange={(e) => change(r.id, 'name', e.target.value)} /></td>
                <td><input value={val(r, 'country')} onChange={(e) => change(r.id, 'country', e.target.value)} /></td>
                <td><input type="number" value={val(r, 'startBalance')} onChange={(e) => change(r.id, 'startBalance', e.target.value)} /></td>
                <td><input type="number" value={val(r, 'currentBalance')} onChange={(e) => change(r.id, 'currentBalance', e.target.value)} /></td>
                <td><input type="number" value={val(r, 'trades')} onChange={(e) => change(r.id, 'trades', e.target.value)} /></td>
                <td className={r.pct >= 0 ? 'up' : 'down'}><b>{pctFmt(r.pct)}</b><small>{money(r.profit)}</small></td>
                <td><input type="checkbox" checked={!!val(r, 'disqualified')} onChange={(e) => change(r.id, 'disqualified', e.target.checked)} /></td>
                <td><button className="danger" onClick={() => del(r)}>✕</button></td>
              </tr>
            ))}
            <tr className="lb-add">
              <td>+</td>
              <td><input placeholder="Magaca trader-ka" value={nw.name} onChange={(e) => setNw({ ...nw, name: e.target.value })} /></td>
              <td><input placeholder="Waddanka" value={nw.country} onChange={(e) => setNw({ ...nw, country: e.target.value })} /></td>
              <td><input type="number" placeholder="10000" value={nw.startBalance} onChange={(e) => setNw({ ...nw, startBalance: e.target.value })} /></td>
              <td><input type="number" placeholder="10000" value={nw.currentBalance} onChange={(e) => setNw({ ...nw, currentBalance: e.target.value })} /></td>
              <td><input type="number" placeholder="0" value={nw.trades} onChange={(e) => setNw({ ...nw, trades: e.target.value })} /></td>
              <td colSpan="3"><button className="btn btn--gold btn--sm" onClick={add} disabled={!nw.name.trim()}>+ Ku dar</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="muted">Talo: Participants → ✅ Oggolow → "📊 Ku dar leaderboard" si trader-ka si toos ah loogu daro. Kadib halkan ku cusboonaysii balance-ka.</p>
    </div>
  )
}
