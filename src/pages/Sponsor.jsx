import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { COL } from '../data/seed'
import { useSettings } from '../hooks/useSettings'
import { useCollection } from '../hooks/useCollection'
import { useReveal } from '../hooks/useReveal'
import Brand from '../components/Brand'
import { Counter } from '../components/Stats'
import SocialLinks, { SocialIcon } from '../components/SocialLinks'
import Footer from '../components/Footer'

const iconKey = (p = "") => { const k = p.toLowerCase(); return k.startsWith("apple") ? "apple" : k === "twitter" ? "x" : k.split(" ")[0] }

export default function Sponsor() {
  const s = useSettings()
  const sp = s.sponsor
  const partners = useCollection('partners')
  const { hash } = useLocation()
  const blank = { company: '', name: '', email: '', website: '', message: '' }
  const [f, setF] = useState(blank)
  const [state, setState] = useState('idle')
  useReveal([s, partners])
  useEffect(() => { document.title = `Sponsor Us | ${s.brand.name}` }, [s.brand.name])
  useEffect(() => {
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 300)
    else window.scrollTo(0, 0)
  }, [hash])

  const send = async (e) => {
    e.preventDefault(); setState('sending')
    try {
      await addDoc(collection(db, COL.messages), {
        name: f.name, email: f.email, type: 'Sponsorship', company: f.company, website: f.website,
        message: `[${f.company}${f.website ? ' · ' + f.website : ''}]\n${f.message}`, read: false, createdAt: serverTimestamp(),
      })
      setState('sent'); setF(blank)
    } catch (err) { console.error(err); setState('error') }
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const audience = (sp.audience || []).filter((a) => a.followers)

  return (
    <>
      <div className="noise" aria-hidden />
      <header className="nav nav--scrolled">
        <div className="nav__inner container">
          <Link to="/" aria-label="Home"><Brand brand={s.brand} /></Link>
          <Link to="/" className="sp-back">← Home</Link>
          <a href="#form" className="btn btn--gold btn--sm sp-navcta">{sp.secondaryButton}</a>
        </div>
      </header>

      <main className="sp">
        <section className="sp-hero">
          <div className="hero__bg"><div className="orb orb--1" /><div className="orb orb--2" /><div className="grid-lines" /></div>
          <div className="container">
            <p className="kicker" data-reveal><span />{sp.homeKicker}</p>
            <h1 data-reveal>{sp.pageTitle} <span className="gold-text italic">{sp.pageGold}</span></h1>
            <p className="sp-hero__text" data-reveal>{sp.pageText}</p>
            <div className="sp-hero__btns" data-reveal>
              <a href="#form" className="btn btn--gold btn--xl">{sp.primaryButton} →</a>
              <a href="#packages" className="btn btn--ghost btn--lg">See packages</a>
            </div>
          </div>
        </section>

        {(sp.stats?.length > 0 || audience.length > 0) && (
          <section className="container sp-numbers">
            {(sp.stats || []).map((x, i) => (
              <div key={i} className="sp-num" data-reveal style={{ transitionDelay: `${i * 0.1}s` }}>
                <strong><Counter to={Number(x.value) || 0} suffix={x.suffix || ''} /></strong><span>{x.label}</span>
              </div>
            ))}
          </section>
        )}

        {audience.length > 0 && (
          <section className="section container">
            <div className="section-head"><p className="kicker" data-reveal><span />Our audience</p><h2 data-reveal>Where our community <span className="gold-text italic">follows us.</span></h2></div>
            <div className="sp-audience">
              {audience.map((a, i) => {
                const k = iconKey(a.platform)
                const link = s.social[k]
                const Tag = link ? 'a' : 'div'
                return (
                  <Tag key={i} className="sp-platform" data-reveal style={{ transitionDelay: `${i * 0.08}s` }} {...(link ? { href: link, target: '_blank', rel: 'noreferrer' } : {})}>
                    <span className={`sp-platform__icon social__a--${k}`}><SocialIcon name={k} size={26} /></span>
                    <strong>{a.followers}</strong><small>{a.platform} {a.note}</small>
                  </Tag>
                )
              })}
            </div>
          </section>
        )}

        {sp.achievements?.length > 0 && (
          <section className="section section--alt">
            <div className="container">
              <div className="section-head"><p className="kicker" data-reveal><span />Proven results</p><h2 data-reveal>Our audience <span className="gold-text italic">takes action.</span></h2></div>
              <div className="sp-wins">
                {sp.achievements.map((a, i) => (
                  <article key={i} className="sp-win" data-reveal style={{ transitionDelay: `${i * 0.1}s` }}>
                    <span className="sp-win__n">{String(i + 1).padStart(2, '0')}</span><h3>{a.title}</h3><p>{a.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {sp.packages?.length > 0 && (
          <section id="packages" className="section container">
            <div className="section-head section-head--center"><p className="kicker" data-reveal><span />Ways to partner</p><h2 data-reveal>Sponsorship <span className="gold-text italic">packages.</span></h2></div>
            <div className="sp-packs">
              {sp.packages.map((p, i) => (
                <article key={i} className="sp-pack" data-reveal style={{ transitionDelay: `${i * 0.08}s` }}>
                  <h3>{p.title}</h3><p>{p.text}</p><a href="#form" className="show__more">Ask about this →</a>
                </article>
              ))}
            </div>
          </section>
        )}

        {partners.length > 0 && (
          <section className="logos sp-logos">
            <div className="logos__track">
              {[...partners, ...partners, ...partners].map((p, i) => <div className="logo" key={i}>{p.logo ? <img src={p.logo} alt={p.name} /> : <><em>◆</em>{p.name}</>}</div>)}
            </div>
          </section>
        )}

        <section id="form" className="section container sp-form-wrap">
          <div>
            <p className="kicker" data-reveal><span />{sp.secondaryButton}</p>
            <h2 className="sp-form__title" data-reveal>{sp.formTitle}</h2>
            <p className="muted" data-reveal>Tell us about your brand and goals — we reply within 48 hours.</p>
            <ul className="contact__list" data-reveal>
              {s.contact.email && <li><span>✉</span><a href={`mailto:${s.contact.email}`}>{s.contact.email}</a></li>}
              {s.contact.phone && <li><span>☎</span><a href={`tel:${s.contact.phone.replace(/\s/g, '')}`}>{s.contact.phone}</a></li>}
            </ul>
            <SocialLinks social={s.social} variant="pills" />
          </div>
          {state === 'sent' ? (
            <div className="form lead__done"><span>✓</span><p>Proposal received — we'll get back to you shortly.</p></div>
          ) : (
            <form className="form" onSubmit={send}>
              <div className="field"><input id="sc" required placeholder=" " value={f.company} onChange={set('company')} /><label htmlFor="sc">Company / Prop firm</label></div>
              <div className="field"><input id="sn" required placeholder=" " value={f.name} onChange={set('name')} /><label htmlFor="sn">Your name</label></div>
              <div className="field"><input id="se" required type="email" placeholder=" " value={f.email} onChange={set('email')} /><label htmlFor="se">Work email</label></div>
              <div className="field"><input id="sw" placeholder=" " value={f.website} onChange={set('website')} /><label htmlFor="sw">Website (optional)</label></div>
              <div className="field"><textarea id="sm" required rows="4" placeholder=" " value={f.message} onChange={set('message')} maxLength={2400} /><label htmlFor="sm">What would you like to achieve?</label></div>
              <button className="btn btn--gold btn--lg btn--full" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : sp.formButton}</button>
              {state === 'error' && <p className="err">Could not send. Please try again.</p>}
            </form>
          )}
        </section>
      </main>
      <Footer footer={s.footer} social={s.social} brand={s.brand} />
    </>
  )
}
