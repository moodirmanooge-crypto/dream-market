import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { COL } from '../data/seed'
import SectionHead from './SectionHead'
import SocialLinks from './SocialLinks'

export default function Contact({ contact, head, social }) {
  const subjects = contact.subjects?.length ? contact.subjects : ['General']
  const blank = { name: '', email: '', type: subjects[0], message: '' }
  const [form, setForm] = useState(blank)
  const [state, setState] = useState('idle')

  const send = async (e) => {
    e.preventDefault(); setState('sending')
    try { await addDoc(collection(db, COL.messages), { ...form, read: false, createdAt: serverTimestamp() }); setState('sent'); setForm(blank) }
    catch (err) { console.error(err); setState('error') }
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <section id="contact" className="section section--alt">
      <div className="container contact">
        <div>
          <SectionHead {...head} />
          <ul className="contact__list" data-reveal>
            {contact.email && <li><span>✉</span><a href={`mailto:${contact.email}`}>{contact.email}</a></li>}
            {contact.phone && <li><span>☎</span><a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a></li>}
            {contact.location && <li><span>⌖</span>{contact.location}</li>}
          </ul>
          <div data-reveal><SocialLinks social={social} variant="pills" /></div>
        </div>

        <form className="form" onSubmit={send} data-reveal>
          <div className="field"><input required value={form.name} onChange={set('name')} placeholder=" " id="n" /><label htmlFor="n">Full name</label></div>
          <div className="field"><input required type="email" value={form.email} onChange={set('email')} placeholder=" " id="e" /><label htmlFor="e">Email</label></div>
          <div className="field field--select">
            <select value={form.type} onChange={set('type')} id="t">{subjects.map((s) => <option key={s}>{s}</option>)}</select>
            <label htmlFor="t">Subject</label>
          </div>
          <div className="field"><textarea required rows="5" value={form.message} onChange={set('message')} placeholder=" " id="m" maxLength={2500} /><label htmlFor="m">Message</label></div>
          <button className="btn btn--gold btn--lg btn--full" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : contact.formButton}</button>
          {state === 'sent' && <p className="ok">✓ Message received — we'll reply soon.</p>}
          {state === 'error' && <p className="err">Could not send. Please try again.</p>}
        </form>
      </div>
    </section>
  )
}
