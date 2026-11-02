import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Brand from './Brand'

const links = ['Home', 'About', 'Team', 'Shows', 'Episodes', 'Guests', 'Contact']

export default function Navbar({ brand, sponsorLabel = 'Sponsor Us' }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState('home')

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      setScrolled(h.scrollTop > 30)
      setProgress((h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100)
      for (const l of [...links].reverse()) {
        const el = document.getElementById(l.toLowerCase())
        if (el && el.getBoundingClientRect().top < 140) { setActive(l.toLowerCase()); break }
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' }, [open])

  const go = (id) => {
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <div className="nav__inner container">
          <button onClick={() => go('home')} aria-label="Home"><Brand brand={brand} /></button>
          <nav className="nav__links">
            {links.map((l) => (
              <button key={l} className={active === l.toLowerCase() ? 'is-active' : ''} onClick={() => go(l.toLowerCase())}>{l}</button>
            ))}
          </nav>
          <Link className="btn btn--gold btn--sm nav__cta" to="/sponsor">{sponsorLabel}</Link>
          <button className={`burger ${open ? 'is-open' : ''}`} onClick={() => setOpen(!open)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
        <div className="nav__progress" style={{ width: `${progress}%` }} />
      </header>

      <div className={`mobile-menu ${open ? 'is-open' : ''}`}>
        <div className="mobile-menu__line" />
        {links.map((l, i) => (
          <button key={l} style={{ transitionDelay: open ? `${0.08 + i * 0.06}s` : '0s' }} onClick={() => go(l.toLowerCase())}>
            <small>0{i + 1}</small>{l}
          </button>
        ))}
        <Link to="/sponsor" className="btn btn--gold btn--lg mobile-menu__cta" style={{ transitionDelay: open ? '.55s' : '0s' }}>{sponsorLabel} →</Link>
        <p className="mobile-menu__foot">{brand.name}</p>
      </div>
    </>
  )
}
