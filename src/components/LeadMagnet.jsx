import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { COL } from '../data/seed'

// "Join Our Newsletter" — collects name + email for the free course (saved to dreamSubscribers)
export default function LeadMagnet({ nl }) {
  const [f, setF] = useState({ name: '', email: '' })
  const [state, setState] = useState('idle')
  const submit = async (e) => {
    e.preventDefault(); setState('sending')
    try {
      await addDoc(collection(db, COL.subscribers), { name: f.name.trim(), email: f.email.trim().toLowerCase(), source: 'free-course', createdAt: serverTimestamp() })
      setState('sent'); setF({ name: '', email: '' })
    } catch (err) { console.error(err); setState('error') }
  }
  return (
    <section id="newsletter" className="section lead">
      <div className="container">
        <div className="lead__box" data-reveal>
          <div className="lead__glow" aria-hidden />
          <div className="lead__copy">
            <p className="kicker"><span />{nl.kicker}</p>
            <h2>{nl.title} <span className="gold-text italic">{nl.gold}</span></h2>
            <p>{nl.text}</p>
            <ul className="lead__perks">{(nl.perks || []).map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
          {state === 'sent' ? (
            <div className="lead__done"><span>✓</span><p>{nl.success}</p><button className="btn btn--ghost btn--sm" onClick={() => setState('idle')}>Add another</button></div>
          ) : (
            <form className="lead__form" onSubmit={submit}>
              <div className="field"><input id="ln" required placeholder=" " value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={80} /><label htmlFor="ln">Your name</label></div>
              <div className="field"><input id="le" required type="email" placeholder=" " value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} maxLength={150} /><label htmlFor="le">Email address</label></div>
              <button className="btn btn--gold btn--lg btn--full" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : nl.button}</button>
              {state === 'error' && <p className="err">Something went wrong. Please try again.</p>}
              <small className="lead__privacy">🔒 {nl.privacy}</small>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
