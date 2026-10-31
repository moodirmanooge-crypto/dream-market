import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import SectionHead from './SectionHead'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', type: 'Guest request', message: '' })
  const [state, setState] = useState('idle')
  const [email, setEmail] = useState('')
  const [sub, setSub] = useState('idle')

  const send = async (e) => {
    e.preventDefault()
    setState('sending')
    try {
      await addDoc(collection(db, 'messages'), { ...form, createdAt: serverTimestamp() })
      setState('sent')
      setForm({ name: '', email: '', type: 'Guest request', message: '' })
    } catch (err) { console.error(err); setState('error') }
  }
  const subscribe = async (e) => {
    e.preventDefault()
    setSub('sending')
    try { await addDoc(collection(db, 'subscribers'), { email, createdAt: serverTimestamp() }); setSub('sent'); setEmail('') }
    catch (err) { console.error(err); setSub('error') }
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <section id="contact" className="section section--alt">
      <div className="container contact">
        <div>
          <SectionHead kicker="Contact" title="Let's build something" gold="together." text="Be a guest, sponsor an episode or partner with Dream Market." />
          <ul className="contact__list" data-reveal>
            <li><span>✉</span>hello@dreammarketpodcast.com</li>
            <li><span>☎</span>+252 61 000 0000</li>
            <li><span>⌖</span>Mogadishu · Nairobi · Dubai</li>
          </ul>
          <form className="newsletter" onSubmit={subscribe} data-reveal>
            <label>Weekly newsletter — new episodes & market insights</label>
            <div>
              <input type="email" required placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="btn btn--gold" disabled={sub === 'sending'}>{sub === 'sending' ? '…' : 'Subscribe'}</button>
            </div>
            {sub === 'sent' && <small className="ok">✓ You're subscribed!</small>}
            {sub === 'error' && <small className="err">Something went wrong. Try again.</small>}
          </form>
        </div>

        <form className="form" onSubmit={send} data-reveal>
          <div className="field"><input required value={form.name} onChange={set('name')} placeholder=" " id="n" /><label htmlFor="n">Full name</label></div>
          <div className="field"><input required type="email" value={form.email} onChange={set('email')} placeholder=" " id="e" /><label htmlFor="e">Email</label></div>
          <div className="field field--select">
            <select value={form.type} onChange={set('type')} id="t">
              <option>Guest request</option><option>Sponsorship</option><option>Partnership</option><option>General</option>
            </select><label htmlFor="t">Subject</label>
          </div>
          <div className="field"><textarea required rows="5" value={form.message} onChange={set('message')} placeholder=" " id="m" maxLength={2500} /><label htmlFor="m">Message</label></div>
          <button className="btn btn--gold btn--lg btn--full" disabled={state === 'sending'}>
            {state === 'sending' ? 'Sending…' : 'Send Message →'}
          </button>
          {state === 'sent' && <p className="ok">✓ Message received — we'll reply soon.</p>}
          {state === 'error' && <p className="err">Could not send. Check Firestore rules and try again.</p>}
        </form>
      </div>
    </section>
  )
}
