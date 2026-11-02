import { useState } from 'react'
import { doc, increment, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { COL } from '../data/seed'

const EXPERIENCE = ['Beginner (less than 1 year)', 'Intermediate (1–3 years)', 'Advanced (3–5 years)', 'Professional (5+ years)']
const COUNTRIES = ['Somalia', 'Somaliland', 'Kenya', 'Ethiopia', 'Djibouti', 'Uganda', 'United Arab Emirates', 'Saudi Arabia', 'Turkey', 'United Kingdom', 'United States', 'Canada', 'Sweden', 'Norway', 'Netherlands', 'Germany']

export const regId = (compId, email) => `${compId}_${email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`

export default function JoinModal({ comp, onClose }) {
  const platforms = (comp.platform || 'MT5').split(/[,/]/).map((p) => p.trim()).filter(Boolean)
  const [f, setF] = useState({ fullName: '', email: '', country: '', whatsapp: '', telegram: '', xUsername: '', experience: EXPERIENCE[0], platform: platforms[0], accountId: '', agreed: false })
  const [state, setState] = useState('idle')
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = async (e) => {
    e.preventDefault(); setErr('')
    if (!f.agreed) return setErr('Please accept the competition rules.')
    setState('sending')
    try {
      const b = writeBatch(db)
      b.set(doc(db, COL.regs, regId(comp.id, f.email)), {
        ...f, email: f.email.trim().toLowerCase(), fullName: f.fullName.trim(), compId: comp.id, compName: comp.name,
        status: 'pending', createdAt: serverTimestamp(),
      })
      b.update(doc(db, COL.competitions, comp.id), { registered: increment(1) })
      await b.commit()
      setState('sent')
    } catch (e2) {
      console.error(e2)
      setState('idle')
      setErr(e2.code === 'permission-denied'
        ? 'This email is already registered for this competition, or registration has just closed.'
        : 'Something went wrong. Please check your connection and try again.')
    }
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__box jm" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        {state === 'sent' ? (
          <div className="lead__done jm__done">
            <span>✓</span>
            <h3>You're registered!</h3>
            <p>Your registration for <b>{comp.name}</b> is <b>pending approval</b>. We'll contact you by email or WhatsApp with your account details.</p>
            <button className="btn btn--gold" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="jm__form">
            <div className="jm__head"><span className="chip">Join the competition</span><h3>{comp.name}</h3></div>
            <div className="jm__grid">
              <div className="field"><input required placeholder=" " id="jf" value={f.fullName} onChange={set('fullName')} maxLength={80} /><label htmlFor="jf">Full name *</label></div>
              <div className="field"><input required type="email" placeholder=" " id="je" value={f.email} onChange={set('email')} maxLength={150} /><label htmlFor="je">Email address *</label></div>
              <div className="field"><input required placeholder=" " id="jc" list="jm-countries" value={f.country} onChange={set('country')} maxLength={60} /><label htmlFor="jc">Country *</label>
                <datalist id="jm-countries">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist></div>
              <div className="field"><input required type="tel" placeholder=" " id="jw" value={f.whatsapp} onChange={set('whatsapp')} maxLength={30} /><label htmlFor="jw">WhatsApp number *</label></div>
              <div className="field"><input placeholder=" " id="jt" value={f.telegram} onChange={set('telegram')} maxLength={60} /><label htmlFor="jt">Telegram username</label></div>
              <div className="field"><input placeholder=" " id="jx" value={f.xUsername} onChange={set('xUsername')} maxLength={60} /><label htmlFor="jx">X (Twitter) username</label></div>
              <div className="field field--select"><select id="jxp" value={f.experience} onChange={set('experience')}>{EXPERIENCE.map((x) => <option key={x}>{x}</option>)}</select><label htmlFor="jxp">Trading experience</label></div>
              <div className="field field--select"><select id="jp" value={f.platform} onChange={set('platform')}>{platforms.map((x) => <option key={x}>{x}</option>)}</select><label htmlFor="jp">Trading platform</label></div>
              <div className="field jm__full"><input placeholder=" " id="ja" value={f.accountId} onChange={set('accountId')} maxLength={60} /><label htmlFor="ja">Account number / Competition ID (if you have one)</label></div>
            </div>
            <label className="jm__agree"><input type="checkbox" checked={f.agreed} onChange={set('agreed')} /><span>I have read and agree to the competition rules. One account per person — duplicate or fake entries are disqualified.</span></label>
            {err && <p className="err">{err}</p>}
            <button className="btn btn--gold btn--lg btn--full" disabled={state === 'sending'}>{state === 'sending' ? 'Registering…' : 'Register Now →'}</button>
          </form>
        )}
      </div>
    </div>
  )
}
