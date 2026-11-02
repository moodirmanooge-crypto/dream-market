import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { COL, seed } from '../data/seed'
import { byOrder } from '../hooks/useCollection'
import { Field } from './fields'
import PhotoPositioner from './PhotoPositioner'

export const SCHEMAS = {
  episodes: {
    title: 'Episodes', single: 'Episode', newOnTop: true,
    fields: [
      ['number', 'number', 'Episode #'], ['title', 'text', 'Title'], ['guest', 'text', 'Guest name'], ['role', 'text', 'Guest role'],
      ['guestImage', 'image', 'Guest photo'], ['category', 'text', 'Category'], ['duration', 'text', 'Duration', 'tusaale: 45 min'],
      ['image', 'image', 'Thumbnail / slide image'], ['video', 'video', 'Video file (upload)'], ['youtube', 'url', 'YouTube link', 'haddii video la upload-gareyn waayo'],
      ['description', 'textarea', 'Description'], ['featured', 'checkbox', '⭐ Featured episode (hal keliya)'], ['showInHero', 'checkbox', '🎞 Ku tus hero slider-ka'], ['hidden', 'checkbox', '🙈 Qari (website-ka ha ka muuqan)'],
    ],
  },
  shows: { title: 'Shows', single: 'Show', fields: [['title', 'text', 'Title'], ['icon', 'text', 'Icon (emoji)'], ['image', 'image', 'Background image'], ['description', 'textarea', 'Description'], ['link', 'url', 'Link'], ['hidden', 'checkbox', '🙈 Qari']] },
  guests: { title: 'Guests', single: 'Guest', fields: [['name', 'text', 'Name'], ['role', 'text', 'Role / company'], ['image', 'image', 'Photo'], ['imageFit', 'fit', '🎯 Hagaaji sawirka circle-ka', 'jiid sawirka ama isticmaal badhamada'], ['hidden', 'checkbox', '🙈 Qari']] },
  team: { title: 'Team', single: 'Team member', fields: [['name', 'text', 'Name'], ['role', 'text', 'Role / Title'], ['focus', 'text', 'Focus', 'tusaale: Filming & Production'], ['image', 'image', 'Photo'], ['imageFit', 'fit', '🎯 Hagaaji sawirka circle-ka', 'jiid sawirka ama isticmaal badhamada'], ['bio', 'textarea', 'Qoraal / Bio', 'ikhtiyaari — wixii aad qorto ayaa website-ka ka muuqda'], ['founder', 'checkbox', '👑 Founder — kaarka weyn ee sare'], ['hidden', 'checkbox', '🙈 Qari']] },
  partners: { title: 'Partners', single: 'Partner', fields: [['name', 'text', 'Name'], ['logo', 'image', 'Logo'], ['link', 'url', 'Website link'], ['hidden', 'checkbox', '🙈 Qari']] },
}

const importing = new Set() // guards against double import (React StrictMode runs effects twice)

export default function CollectionManager({ name }) {
  const schema = SCHEMAS[name]
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(null) // null = closed, {} = new, {id,…} = edit
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    setForm(null)
    let checked = false
    return onSnapshot(collection(db, COL[name]), async (s) => {
      setRows(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byOrder))
      if (checked || importing.has(name)) return
      checked = true
      importing.add(name)
      // First time this list is opened: copy what the website currently shows into Firestore,
      // so the admin can edit / delete those exact items.
      try {
        const site = await getDoc(doc(db, COL.settings, 'site'))
        if (site.data()?.seeded?.[name]) return
        if (s.empty && seed[name]?.length) {
          const b = writeBatch(db)
          seed[name].forEach((it) => b.set(doc(collection(db, COL[name])), { ...it, createdAt: serverTimestamp() }))
          await b.commit()
        }
        await setDoc(doc(db, COL.settings, 'site'), { seeded: { [name]: true } }, { merge: true })
      } catch (e) { setErr(e.message) }
    }, (e) => setErr(e.message))
  }, [name])

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr('')
    const { id, createdAt, ...data } = form
    try {
      if (data.featured) { // only one featured episode
        const b = writeBatch(db)
        rows.filter((r) => r.featured && r.id !== id).forEach((r) => b.update(doc(db, COL[name], r.id), { featured: false }))
        await b.commit()
      }
      if (id) await updateDoc(doc(db, COL[name], id), { ...data, updatedAt: serverTimestamp() })
      else {
        const orders = rows.map((r) => r.order ?? 0)
        const order = rows.length ? (schema.newOnTop ? Math.min(...orders) - 1 : Math.max(...orders) + 1) : 0
        await addDoc(collection(db, COL[name]), { ...data, order, createdAt: serverTimestamp() })
      }
      setForm(null)
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  const move = async (i, d) => {
    const j = i + d
    if (j < 0 || j >= rows.length) return
    const list = [...rows];[list[i], list[j]] = [list[j], list[i]]
    const b = writeBatch(db)
    list.forEach((r, k) => r.order !== k && b.update(doc(db, COL[name], r.id), { order: k }))
    try { await b.commit() } catch (e) { setErr(e.message) }
  }

  const toggle = (r, key) => updateDoc(doc(db, COL[name], r.id), { [key]: !r[key] }).catch((e) => setErr(e.message))
  const remove = async (r) => { if (confirm(`Tirtir "${r.title || r.name}"?`)) await deleteDoc(doc(db, COL[name], r.id)).catch((e) => setErr(e.message)) }

  const thumb = (r) => r.image || r.logo || r.guestImage

  return (
    <div>
      <div className="adm-pagehead">
        <div><h2>{schema.title} <small>({rows.length})</small></h2><p>Fallaaraha ↑ ↓ ku beddel meesha uu website-ka kaga muuqdo.</p></div>
        <button className="btn btn--gold" onClick={() => setForm({})}>+ {schema.single} cusub</button>
      </div>
      {err && <p className="err" onClick={() => setErr('')}>{err} ✕</p>}

      {form && (
        <div className="adm-drawer" onClick={() => setForm(null)}>
          <form className="adm-drawer__box" onSubmit={save} onClick={(e) => e.stopPropagation()}>
            <div className="adm-drawer__head">
              <h3>{form.id ? 'Wax ka beddel' : 'Ku dar'} {schema.single}</h3>
              <button type="button" onClick={() => setForm(null)}>✕</button>
            </div>
            <div className="adm-drawer__body">
              {schema.fields.map(([k, type, label, hint]) => type === 'fit' ? (
                <div key={k} className="adm-field"><span>{label}{hint && <em>{hint}</em>}</span>
                  <PhotoPositioner image={form.image} value={form[k]} onChange={(v) => setForm({ ...form, [k]: v })} /></div>
              ) : (
                <Field key={k} label={label} hint={hint} type={type} value={form[k]} folder={name} onChange={(v) => setForm({ ...form, [k]: v })} />
              ))}
            </div>
            <div className="adm-drawer__foot">
              <button type="button" className="btn btn--ghost" onClick={() => setForm(null)}>Jooji</button>
              <button className="btn btn--gold" disabled={busy}>{busy ? 'Kaydinaya…' : '💾 Kaydi'}</button>
            </div>
          </form>
        </div>
      )}

      {rows.length === 0 && <div className="adm-card adm-empty">Weli wax ma jiraan. Riix "+ {schema.single} cusub" ama Dashboard → "Seed demo data".</div>}
      <div className="adm-items">
        {rows.map((r, i) => (
          <div key={r.id} className={`adm-item ${r.hidden ? 'is-hidden' : ''}`}>
            <span className="adm-item__pos">{i + 1}</span>
            <div className="adm-item__thumb">{thumb(r) ? <img src={thumb(r)} alt="" /> : <span>{r.icon || (r.title || r.name || '?')[0]}</span>}</div>
            <div className="adm-item__info">
              <b>{r.number ? `#${r.number} · ` : ''}{r.title || r.name}</b>
              <small>{[r.guest, r.role, r.focus, r.category, r.duration].filter(Boolean).join(' · ') || r.description || r.link || ''}</small>
              <div className="adm-tags">
                {r.featured && <em>⭐ Featured</em>}{r.founder && <em>👑 Founder</em>}{r.showInHero && <em>🎞 Hero</em>}{(r.video || r.youtube) && <em>▶ Video</em>}{r.hidden && <em className="off">🙈 Qarsoon</em>}
              </div>
            </div>
            <div className="adm-item__btns">
              <button onClick={() => move(i, -1)} disabled={i === 0} title="Kor">↑</button>
              <button onClick={() => move(i, 1)} disabled={i === rows.length - 1} title="Hoos">↓</button>
              <button onClick={() => toggle(r, 'hidden')} title="Qari / Muuji">{r.hidden ? '👁' : '🙈'}</button>
              <button onClick={() => setForm(r)}>Edit</button>
              <button className="danger" onClick={() => remove(r)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
