import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StudioScene from './StudioScene'
import TextRotator from './TextRotator'

const HUES = [222, 210, 260, 195, 235, 245]
const DURATION = 6000

export default function Hero({ episodes, onPlay }) {
  const slides = episodes.slice(0, 5)
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [heroImg, setHeroImg] = useState(null)

  // Optional: put your own photo at public/hero.jpg and it is used automatically
  useEffect(() => {
    const img = new Image()
    img.onload = () => setHeroImg('/hero.jpg')
    img.src = '/hero.jpg'
  }, [])

  useEffect(() => {
    if (paused || slides.length < 2) return
    const t = setTimeout(() => setIdx((i) => (i + 1) % slides.length), DURATION)
    return () => clearTimeout(t)
  }, [idx, paused, slides.length])

  const s = slides[idx] || {}
  const headline = ['Where', 'Financial', 'Minds', 'Meet.']
  const image = s.image || (idx === 0 ? heroImg : null)

  const touchRef = useRef(0)
  return (
    <section id="home" className="hero">
      <div className="hero__bg"><div className="orb orb--1" /><div className="orb orb--2" /><div className="grid-lines" /></div>

      <div className="container hero__inner">
        <div className="hero__copy">
          <motion.div className="hero__line" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 2, duration: 1.1, ease: [0.7, 0, 0.2, 1] }} />
          <motion.p className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.1 }}>
            <span className="live-dot" /> New episode every week
          </motion.p>

          <h1 className="hero__title">
            {headline.map((w, i) => (
              <span className="word-mask" key={w}>
                <motion.span
                  className={w === 'Minds' ? 'gold-text' : ''}
                  initial={{ y: '110%', rotate: 6 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{ delay: 2.15 + i * 0.12, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
                >{w}</motion.span>
              </span>
            ))}
          </h1>

          <motion.p className="hero__sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8 }}>
            Business. Finance. Technology. People. <br />
            Conversations about <TextRotator words={['Finance', 'Crypto', 'Markets', 'Startups', 'Technology', 'Leadership']} />
          </motion.p>

          <motion.div className="hero__ctas" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3 }}>
            <a href="#episodes" className="btn btn--gold btn--lg magnetic">
              <span>WATCH EPISODES</span>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" /></svg>
            </a>
            <a href="#about" className="btn btn--ghost btn--lg">Our Story</a>
          </motion.div>

          <motion.div className="hero__platforms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.3 }}>
            <span>Available on</span>
            <b>YouTube</b><b>Spotify</b><b>Apple Podcasts</b>
          </motion.div>
        </div>

        <motion.div
          className="hero__slider"
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(e) => (touchRef.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - touchRef.current
            if (Math.abs(dx) > 40) setIdx((i) => (i + (dx < 0 ? 1 : -1) + slides.length) % slides.length)
          }}
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={idx}
              className="slide"
              initial={{ opacity: 0, scale: 1.12, clipPath: 'inset(0 0 0 100%)' }}
              animate={{ opacity: 1, scale: 1, clipPath: 'inset(0 0 0 0%)' }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 1.1, ease: [0.7, 0, 0.2, 1] }}
            >
              {image ? <img className="slide__img kenburns" src={image} alt={s.title} /> : <StudioScene hue={HUES[idx % HUES.length]} />}
              <div className="slide__shade" />
              <div className="slide__info">
                <motion.span className="chip" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  EP {s.number} · {s.category}
                </motion.span>
                <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62 }}>{s.title}</motion.h3>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>with <b>{s.guest}</b> · {s.duration}</motion.p>
              </div>
              <button className="slide__play" onClick={() => onPlay(s)} aria-label="Play episode">
                <svg viewBox="0 0 24 24" width="26" height="26"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
              </button>
              <span className="slide__brand">sabahvisions</span>
            </motion.div>
          </AnimatePresence>

          <div className="slider__bars">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`bar ${i === idx ? 'is-on' : ''} ${i < idx ? 'is-done' : ''}`} aria-label={`Slide ${i + 1}`}>
                <i style={{ animationDuration: `${DURATION}ms`, animationPlayState: paused ? 'paused' : 'running' }} />
              </button>
            ))}
          </div>
          <div className="slider__arrows">
            <button onClick={() => setIdx((idx - 1 + slides.length) % slides.length)} aria-label="Previous">‹</button>
            <button onClick={() => setIdx((idx + 1) % slides.length)} aria-label="Next">›</button>
          </div>
        </motion.div>
      </div>

      <a href="#ticker" className="scroll-hint" aria-label="Scroll"><span /></a>
    </section>
  )
}
