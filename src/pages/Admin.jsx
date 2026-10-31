import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { seed } from '../data/seed'

const SCHEMAS = {
  episodes: [['number', 'number'], ['title'], ['guest'], ['role'], ['category'], ['duration'], ['youtube', 'url'], ['image', 'url'], ['description', 'textarea'], ['featured', 'checkbox']],
  shows: [['title'], ['icon'], ['description', 'textarea']],
  guests: [['name'], ['role'], ['image', 'url']],
  partners: [['name'], ['logo', 'url']],
}
const TABS = [...Object.keys(SCHEMAS), 'messages', 'subscribers']

export default function Admin() {
  const [user, setUser] = useState(undefined)
  const [cred, setCred] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const [tab, setTab] = useState('episodes')
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({})
  const [editId, setEditId] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => onAuthStateChanged(auth, setUser), [])
  useEffect(() => {
    if (!user) return
    return onSnapshot(collection(db, tab), (s) => setRows(s.docs.map((d) => ({ id: d.id, ...d.data() }))), (e) => setErr(e.message))
  }, [tab, user])

  const login = async (e) => {
    e.preventDefault(); setErr('')
    try { await signInWithEmailAndPassword(auth, cred.email, cred.password) } catch (e) { setErr(e.message) }
  }

  const save = async (e) => {
    e.preventDefault(); setBusy(true)
    const data = { ...form }
    if (data.number !== undefined) data.number = Number(data.number) || 0
    try {
      if (editId) await updateDoc(doc(db, tab, editId), data)
      else await addDoc(collection(db, tab), { ...data, createdAt: serverTimestamp() })
      setForm({}); setEditId(null)
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  const remove = async (id) => { if (confirm('Delete this item?')) await deleteDoc(doc(db, tab, id)) }

  const seedAll = async () => {
    if (!confirm('Upload all demo content (episodes, shows, guests, partners) to Firestore?')) return
    setBusy(true)
    try {
      const b = writeBatch(db)
      Object.entries(seed).forEach(([col, list]) => list.forEach((item, i) => {
        b.set(doc(collection(db, col)), { ...item, createdAt: { seconds: i, nanoseconds: 0 } })
      }))
      await b.commit()
      alert('Done! Demo content is now in Firestore.')
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  if (user === undefined) return <div className="admin admin--center">Loading…</div>

  if (!user) return (
    <div className="admin admin--center">
      <form className="admin__login" onSubmit={login}>
        <div className="nav__brand"><span className="nav__logo">DMP</span><span className="nav__name">ADMIN</span></div>
        <input type="email" placeholder="Admin email" value={cred.email} onChange={(e) => setCred({ ...cred, email: e.target.value })} required />
        <input type="password" placeholder="Password" value={cred.password} onChange={(e) => setCred({ ...cred, password: e.target.value })} required />
        <button className="btn btn--gold btn--full">Sign in</button>
        {err && <p className="err">{err}</p>}
        <small>Create the admin user in Firebase Console → Authentication → Users.</small>
        <a href="#/">← Back to website</a>
      </form>
    </div>
  )

  const schema = SCHEMAS[tab]
  return (
    <div className="admin">
      <header className="admin__top">
        <div className="nav__brand"><span className="nav__logo">DMP</span><span className="nav__name">ADMIN PANEL</span></div>
        <div className="admin__actions">
          <a className="btn btn--ghost btn--sm" href="#/">View site</a>
          <button className="btn btn--ghost btn--sm" onClick={seedAll} disabled={busy}>Seed demo data</button>
          <button className="btn btn--gold btn--sm" onClick={() => signOut(auth)}>Sign out</button>
        </div>
      </header>
      <nav className="admin__tabs">
        {TABS.map((t) => <button key={t} className={t === tab ? 'is-on' : ''} onClick={() => { setTab(t); setForm({}); setEditId(null) }}>{t}</button>)}
      </nav>
      {err && <p className="err admin__err" onClick={() => setErr('')}>{err} ✕</p>}

      <div className="admin__body">
        {schema && (
          <form className="admin__form" onSubmit={save}>
            <h3>{editId ? 'Edit' : 'Add'} {tab.slice(0, -1)}</h3>
            {schema.map(([k, type]) => (
              <label key={k} className={type === 'checkbox' ? 'admin__check' : ''}>
                <span>{k}</span>
                {type === 'textarea' ? <textarea rows="3" value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                  : type === 'checkbox' ? <input type="checkbox" checked={!!form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} />
                  : <input type={type || 'text'} value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} required={k === 'title' || k === 'name'} />}
              </label>
            ))}
            <div className="admin__formbtns">
              <button className="btn btn--gold" disabled={busy}>{editId ? 'Update' : 'Add'}</button>
              {editId && <button type="button" className="btn btn--ghost" onClick={() => { setForm({}); setEditId(null) }}>Cancel</button>}
            </div>
          </form>
        )}
        <div className="admin__list">
          <h3>{tab} <small>({rows.length})</small></h3>
          {rows.length === 0 && <p className="muted">Nothing here yet.</p>}
          {rows.map((r) => (
            <div key={r.id} className="admin__row">
              <div>
                <b>{r.title || r.name || r.email}</b>
                <small>{r.guest || r.role || r.type || r.description || ''}{r.message ? ` — ${r.message}` : ''}</small>
              </div>
              <div className="admin__rowbtns">
                {schema && <button onClick={() => { const { id, createdAt, ...rest } = r; setForm(rest); setEditId(id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Edit</button>}
                <button className="danger" onClick={() => remove(r.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
