import { useEffect, useState } from 'react'

const links = ['Home', 'About', 'Shows', 'Episodes', 'Guests', 'Partners', 'Contact']

export default function Navbar() {
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
          <button className="nav__brand" onClick={() => go('home')} aria-label="Dream Market Podcast home">
            <span className="nav__logo">DMP</span>
            <span className="nav__name">DREAM MARKET PODCAST</span>
          </button>
          <nav className="nav__links">
            {links.map((l) => (
              <button key={l} className={active === l.toLowerCase() ? 'is-active' : ''} onClick={() => go(l.toLowerCase())}>{l}</button>
            ))}
          </nav>
          <button className="btn btn--gold btn--sm nav__cta" onClick={() => go('episodes')}>Listen Now</button>
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
        <p className="mobile-menu__foot">Business. Finance. Technology. People.</p>
      </div>
    </>
  )
}
