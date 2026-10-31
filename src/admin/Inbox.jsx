import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { COL } from '../data/seed'

const when = (t) => (t?.toDate ? t.toDate().toLocaleString() : '')

export default function Inbox({ name }) {
  const [rows, setRows] = useState([])
  const [err, setErr] = useState('')
  useEffect(() => onSnapshot(collection(db, COL[name]),
    (s) => setRows(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))),
    (e) => setErr(e.message)), [name])

  const del = (r) => confirm('Tirtir?') && deleteDoc(doc(db, COL[name], r.id))
  const csv = () => {
    const blob = new Blob(['email,date\n' + rows.map((r) => `${r.email},${when(r.createdAt)}`).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'subscribers.csv'; a.click()
  }

  return (
    <div>
      <div className="adm-pagehead">
        <div><h2>{name === 'messages' ? 'Fariimaha (Contact)' : 'Subscribers'} <small>({rows.length})</small></h2></div>
        {name === 'subscribers' && rows.length > 0 && <button className="btn btn--ghost" onClick={csv}>⬇ Export CSV</button>}
      </div>
      {err && <p className="err">{err}</p>}
      {rows.length === 0 && <div className="adm-card adm-empty">Weli wax ma jiraan.</div>}
      <div className="adm-items">
        {rows.map((r) => name === 'messages' ? (
          <div key={r.id} className={`adm-msg ${r.read ? '' : 'is-new'}`} onClick={() => !r.read && updateDoc(doc(db, COL.messages, r.id), { read: true })}>
            <div className="adm-msg__top"><b>{r.name}</b><span className="chip">{r.type}</span><small>{when(r.createdAt)}</small></div>
            <a href={`mailto:${r.email}`} className="adm-msg__mail">{r.email}</a>
            <p>{r.message}</p>
            <div className="adm-item__btns"><a className="btn btn--ghost btn--sm" href={`mailto:${r.email}?subject=Re: ${r.type}`}>↩ Jawaab</a><button className="danger" onClick={(e) => { e.stopPropagation(); del(r) }}>Tirtir</button></div>
          </div>
        ) : (
          <div key={r.id} className="adm-item"><div className="adm-item__info"><b>{r.email}</b><small>{when(r.createdAt)}</small></div>
            <div className="adm-item__btns"><button className="danger" onClick={() => del(r)}>✕</button></div></div>
        ))}
      </div>
    </div>
  )
}
