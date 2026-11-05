import { useEffect, useRef, useState } from 'react'
import { collection, doc, getDoc, increment, onSnapshot, query, serverTimestamp, where, writeBatch } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { db } from '../firebase'
import { COL } from '../data/seed'
import { cleanName, emailError, emailLockId, ensureUser, getMyReg, initials, LUCKY_MAX, LUCKY_MIN, nameError, nameKey, nameLockId, phoneError, randomLucky, regIdFor, saveMyReg, shrinkImage, uploadPhoto } from './participants'

const EXPERIENCE = ['Beginner (less than 1 year)', 'Intermediate (1–3 years)', 'Advanced (3–5 years)', 'Professional (5+ years)']
const COUNTRIES = ['Somalia', 'Somaliland', 'Kenya', 'Ethiopia', 'Djibouti', 'Uganda', 'United Arab Emirates', 'Saudi Arabia', 'Turkey', 'United Kingdom', 'United States', 'Canada', 'Sweden', 'Norway', 'Netherlands', 'Germany']

// Finds this device's registration (works even if the browser storage was cleared)
export function useMyReg(compId) {
  const [mine, setMine] = useState(() => getMyReg(compId))
  useEffect(() => onAuthStateChanged(auth, async (u) => {
    if (!u || !compId || compId === 'sample') return
    try {
      const d = await getDoc(doc(db, COL.regs, regIdFor(compId, u.uid)))
      if (d.exists()) {
        const r = { regId: d.id, name: d.data().fullName, photo: d.data().photo || '', lucky: d.data().luckyNumber || null }
        saveMyReg(compId, r); setMine(r)
      }
    } catch { /* not registered */ }
  }), [compId])
  return [mine, setMine]
}

/* Step 1: registration form (+ photo)  →  Step 2: "Try your luck" number 1–1000  →  Step 3: done */
export default function JoinModal({ comp, onClose, startAtLucky = false }) {
  const saved = getMyReg(comp.id)
  const [step, setStep] = useState(saved?.regId ? (saved.lucky ? 'already' : 'lucky') : startAtLucky ? 'lucky' : 'form')
  const [reg, setReg] = useState(saved)
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__box jm" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        <div className="jm__steps">{['Register', 'Try your luck', 'Done'].map((l, i) => <span key={l} className={['form', 'lucky', 'done'].indexOf(step) >= i ? 'is-on' : ''}><b>{i + 1}</b>{l}</span>)}</div>
        {step === 'already' && reg && (
          <div className="jm__done">
            <div className="jm__luckyball">#{reg.lucky}</div>
            <h3>You're already registered ✓</h3>
            <p>This device is already registered for <b>{comp.name}</b> with lucky number <b>#{reg.lucky}</b>. You can join again when a new competition opens.</p>
            <button className="btn btn--gold btn--lg" onClick={onClose}>OK</button>
          </div>
        )}
        {step === 'form' && <RegisterForm comp={comp} onDone={(r) => { setReg(r); setStep('lucky') }} />}
        {step === 'lucky' && reg && <LuckyPicker comp={comp} reg={reg} onDone={(r) => { setReg(r); setStep('done') }} />}
        {step === 'done' && reg && (
          <div className="jm__done">
            <div className="jm__confetti" aria-hidden>{Array.from({ length: 28 }).map((_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * 0.12}s`, background: ['#d4af37', '#f2d27a', '#3ddc84', '#fff', '#ff6b6b'][i % 5] }} />)}</div>
            <div className="jm__luckyball">#{reg.lucky}</div>
            <h3>You're in, {reg.name?.split(' ')[0]}! 🍀</h3>
            <p>Your registration for <b>{comp.name}</b> is received and your lucky number <b>#{reg.lucky}</b> is locked in. Winners will be announced on this page — good luck!</p>
            <button className="btn btn--gold btn--lg" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

function RegisterForm({ comp, onDone }) {
  const [f, setF] = useState({ fullName: '', email: '', country: '', whatsapp: '', telegram: '', xUsername: '', experience: EXPERIENCE[0], accountId: '', agreed: false })
  const [touched, setTouched] = useState({})
  const [photo, setPhoto] = useState(null) // { blob, url }
  const [state, setState] = useState('idle')
  const [err, setErr] = useState('')
  const file = useRef(null)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }))
  const errs = { fullName: nameError(f.fullName), email: emailError(f.email), whatsapp: phoneError(f.whatsapp), country: f.country.trim().length < 2 ? 'Please enter your country.' : '' }
  const show = (k) => (touched[k] || state === 'tried') && errs[k]

  const pick = async (fl) => {
    if (!fl) return
    setErr('')
    try { const blob = await shrinkImage(fl); setPhoto({ blob, url: URL.createObjectURL(blob) }) } catch (e) { setErr(e.message) }
  }

  const submit = async (e) => {
    e.preventDefault(); setErr('')
    if (Object.values(errs).some(Boolean)) { setState('tried'); return setErr('Please fix the highlighted fields.') }
    if (!f.agreed) return setErr('Please accept the competition rules.')
    setState('sending')
    try {
      const user = await ensureUser()
      const name = cleanName(f.fullName)
      const email = f.email.trim().toLowerCase()
      const id = regIdFor(comp.id, user.uid)
      // one registration per device, per email and per name
      const [mine, em, nm] = await Promise.all([
        getDoc(doc(db, COL.regs, id)).catch(() => null),
        getDoc(doc(db, COL.emailLocks, emailLockId(comp.id, email))).catch(() => null),
        getDoc(doc(db, COL.nameLocks, nameLockId(comp.id, name))).catch(() => null),
      ])
      if (mine?.exists()) { setState('idle'); return setErr('This device has already registered for this competition.') }
      if (em?.exists()) { setState('idle'); return setErr('This email is already registered for this competition.') }
      if (nm?.exists()) { setState('idle'); return setErr('This name is already registered for this competition.') }
      let photoUrl = ''
      if (photo?.blob) {
        try { photoUrl = await uploadPhoto(photo.blob, user.uid) } catch { photoUrl = '' } // registration still works if the upload fails
      }
      const b = writeBatch(db)
      b.set(doc(db, COL.regs, id), {
        fullName: name, email, country: f.country.trim(), whatsapp: f.whatsapp.trim(), telegram: f.telegram.trim(), xUsername: f.xUsername.trim(),
        experience: f.experience, accountId: f.accountId.trim(), agreed: true, photo: photoUrl,
        compId: comp.id, compName: comp.name, uid: user.uid, nameKey: nameKey(name), status: 'pending', createdAt: serverTimestamp(),
      })
      b.set(doc(db, COL.emailLocks, emailLockId(comp.id, email)), { compId: comp.id, regId: id, uid: user.uid })
      b.set(doc(db, COL.nameLocks, nameLockId(comp.id, name)), { compId: comp.id, regId: id, uid: user.uid })
      b.set(doc(db, COL.compPublic, id), { compId: comp.id, name, country: f.country.trim(), photo: photoUrl, uid: user.uid, createdAt: serverTimestamp() })
      b.update(doc(db, COL.competitions, comp.id), { registered: increment(1) })
      await b.commit()
      const r = { regId: id, name, photo: photoUrl, lucky: null }
      saveMyReg(comp.id, r)
      onDone(r)
    } catch (e2) {
      console.error(e2); setState('idle')
      setErr(e2.code === 'permission-denied' ? 'This email, name or device is already registered for this competition — or registration has just closed.'
        : e2.code === 'auth/admin-restricted-operation' || e2.code === 'auth/operation-not-allowed' ? 'Registration is temporarily unavailable. Please try again later.'
          : 'Something went wrong. Please check your connection and try again.')
    }
  }

  const F = (k, label, props = {}) => (
    <div className={`field ${show(k) ? 'is-bad' : ''} ${props.full ? 'jm__full' : ''}`}>
      <input placeholder=" " id={`j-${k}`} value={f[k]} onChange={set(k)} onBlur={blur(k)} {...props.input} />
      <label htmlFor={`j-${k}`}>{label}</label>
      {show(k) && <small className="field__err">{errs[k]}</small>}
    </div>
  )

  return (
    <form onSubmit={submit} className="jm__form" noValidate>
      <div className="jm__head"><span className="chip">Join the competition</span><h3>{comp.name}</h3></div>
      <div className="jm__photo">
        <button type="button" className="jm__avatar" onClick={() => file.current.click()}>
          {photo ? <img src={photo.url} alt="" /> : <span>{initials(f.fullName) || '📷'}</span>}
          <em>{photo ? 'Change' : 'Add photo'}</em>
        </button>
        <div><b>Your photo</b><small>Shown on the participants wall — and on the winners podium if you win! (JPG / PNG)</small></div>
        <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files[0]); e.target.value = '' }} />
      </div>
      <div className="jm__grid">
        {F('fullName', 'Full name * (letters only)', { input: { autoComplete: 'name', maxLength: 60 } })}
        {F('email', 'Email address *', { input: { type: 'email', autoComplete: 'email', inputMode: 'email', maxLength: 120 } })}
        <div className={`field ${show('country') ? 'is-bad' : ''}`}>
          <input placeholder=" " id="j-country" list="jm-countries" value={f.country} onChange={set('country')} onBlur={blur('country')} maxLength={60} />
          <label htmlFor="j-country">Country *</label>
          <datalist id="jm-countries">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist>
          {show('country') && <small className="field__err">{errs.country}</small>}
        </div>
        {F('whatsapp', 'WhatsApp number * (+252…)', { input: { type: 'tel', inputMode: 'tel', autoComplete: 'tel', maxLength: 20 } })}
        <div className="field"><input placeholder=" " id="jt" value={f.telegram} onChange={set('telegram')} maxLength={60} /><label htmlFor="jt">Telegram username</label></div>
        <div className="field"><input placeholder=" " id="jx" value={f.xUsername} onChange={set('xUsername')} maxLength={60} /><label htmlFor="jx">X (Twitter) username</label></div>
        <div className="field field--select jm__full"><select id="jxp" value={f.experience} onChange={set('experience')}>{EXPERIENCE.map((x) => <option key={x}>{x}</option>)}</select><label htmlFor="jxp">Trading experience</label></div>
        <div className="field jm__full"><input placeholder=" " id="ja" value={f.accountId} onChange={set('accountId')} maxLength={60} /><label htmlFor="ja">Account number / Competition ID (if you have one)</label></div>
      </div>
      <label className="jm__agree"><input type="checkbox" checked={f.agreed} onChange={set('agreed')} /><span>I have read and agree to the competition rules. One account per person — duplicate or fake entries are disqualified.</span></label>
      {err && <p className="err">{err}</p>}
      <button className="btn btn--gold btn--lg btn--full" disabled={state === 'sending'}>{state === 'sending' ? 'Registering…' : 'Next: Try your luck →'}</button>
    </form>
  )
}

function LuckyPicker({ comp, reg, onDone }) {
  const [taken, setTaken] = useState(new Set())
  const [n, setN] = useState('')
  const [spin, setSpin] = useState(false)
  const [state, setState] = useState('idle')
  const [err, setErr] = useState('')
  useEffect(() => onSnapshot(query(collection(db, COL.lucky), where('compId', '==', comp.id)), (s) => setTaken(new Set(s.docs.map((d) => d.data().number))), () => {}), [comp.id])

  const num = Number(n)
  const valid = Number.isInteger(num) && num >= LUCKY_MIN && num <= LUCKY_MAX
  const isTaken = valid && taken.has(num)

  const roll = () => {
    setSpin(true); setErr('')
    let i = 0
    const t = setInterval(() => {
      setN(String(LUCKY_MIN + Math.floor(Math.random() * LUCKY_MAX)))
      if (++i > 14) { clearInterval(t); setN(String(randomLucky(taken))); setSpin(false) }
    }, 55)
  }

  const submit = async (e) => {
    e.preventDefault(); setErr('')
    if (!valid) return setErr(`Choose a number between ${LUCKY_MIN} and ${LUCKY_MAX}.`)
    if (isTaken) return setErr(`#${num} is already taken — pick another number.`)
    setState('sending')
    try {
      const user = await ensureUser()
      const b = writeBatch(db)
      b.set(doc(db, COL.lucky, `${comp.id}_${num}`), { compId: comp.id, number: num, regId: reg.regId, uid: user.uid, createdAt: serverTimestamp() }) // no name: nobody can see who owns a number
      b.update(doc(db, COL.regs, reg.regId), { luckyNumber: num })
      b.update(doc(db, COL.compPublic, reg.regId), { hasLucky: true })
      await b.commit()
      const r = { ...reg, lucky: num }
      saveMyReg(comp.id, r)
      onDone(r)
    } catch (e2) {
      console.error(e2); setState('idle')
      setErr(e2.code === 'permission-denied' ? `#${num} was just taken by someone else (or you already picked a number). Try another one.` : 'Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={submit} className="jm__form lk">
      <div className="jm__head"><span className="chip">🍀 Bonus</span><h3>Try your luck!</h3>
        <p className="muted">Pick your lucky number between <b>{LUCKY_MIN}</b> and <b>{LUCKY_MAX}</b>. Each number can be claimed by only one trader — once you submit, it's yours. Your number stays private: only you and the organizers can see it.</p></div>
      <div className={`lk__ball ${spin ? 'is-spin' : ''} ${isTaken ? 'is-bad' : valid ? 'is-ok' : ''}`}>
        <input type="number" inputMode="numeric" min={LUCKY_MIN} max={LUCKY_MAX} placeholder="?" value={n} onChange={(e) => { setN(e.target.value.replace(/\D/g, '').slice(0, 4)); setErr('') }} aria-label="Lucky number" />
      </div>
      <p className={`lk__status ${isTaken ? 'err' : valid ? 'ok' : 'muted'}`}>
        {isTaken ? `❌ #${num} is taken` : valid ? `✓ #${num} is available` : `${LUCKY_MAX - taken.size} numbers still available`}
      </p>
      <div className="lk__btns">
        <button type="button" className="btn btn--ghost btn--lg" onClick={roll} disabled={spin}>🎲 Random number</button>
        <button className="btn btn--gold btn--lg" disabled={state === 'sending' || spin || !valid || isTaken}>{state === 'sending' ? 'Locking…' : 'Submit my number →'}</button>
      </div>
      {err && <p className="err">{err}</p>}
    </form>
  )
}
