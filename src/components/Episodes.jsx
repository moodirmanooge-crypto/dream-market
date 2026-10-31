import { useMemo, useRef, useState } from 'react'
import StudioScene from './StudioScene'
import SectionHead from './SectionHead'

export default function Episodes({ episodes, onPlay, head }) {
  const cats = useMemo(() => ['All', ...new Set(episodes.map((e) => e.category).filter(Boolean))], [episodes])
  const [cat, setCat] = useState('All')
  const track = useRef(null)
  const drag = useRef({ down: false, x: 0, left: 0, moved: false })
  const list = cat === 'All' ? episodes : episodes.filter((e) => e.category === cat)

  const scroll = (dir) => {
    const el = track.current
    el.scrollBy({ left: dir * (el.querySelector('.ep')?.offsetWidth + 24 || 320), behavior: 'smooth' })
  }

  const onDown = (e) => { drag.current = { down: true, x: e.pageX, left: track.current.scrollLeft, moved: false }; track.current.classList.add('is-drag') }
  const onMove = (e) => {
    if (!drag.current.down) return
    const dx = e.pageX - drag.current.x
    if (Math.abs(dx) > 5) drag.current.moved = true
    track.current.scrollLeft = drag.current.left - dx
  }
  const onUp = () => { drag.current.down = false; track.current?.classList.remove('is-drag') }

  return (
    <section id="episodes" className="section">
      <div className="container">
        <div className="episodes__top">
          <SectionHead {...head} />
          <div className="arrows" data-reveal>
            <button onClick={() => scroll(-1)} aria-label="Previous">←</button>
            <button onClick={() => scroll(1)} aria-label="Next">→</button>
          </div>
        </div>
        <div className="chips" data-reveal>
          {cats.map((c) => <button key={c} className={c === cat ? 'is-on' : ''} onClick={() => { setCat(c); track.current.scrollTo({ left: 0, behavior: 'smooth' }) }}>{c}</button>)}
        </div>
      </div>

      <div className="ep-track" ref={track} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
        {list.map((e, i) => (
          <article className="ep" key={e.id || e.title} style={{ animationDelay: `${i * 0.07}s` }}
            onClick={() => !drag.current.moved && onPlay(e)}>
            <div className="ep__media">
              {e.image ? <img src={e.image} alt={e.title} draggable="false" /> : <StudioScene hue={200 + ((i * 23) % 70)} />}
              <span className="ep__num">#{e.number}</span>
              <span className="ep__play">▶</span>
            </div>
            <div className="ep__body">
              <span className="ep__cat">{e.category} · {e.duration}{(e.video || e.youtube) ? ' · ▶ Video' : ''}</span>
              <h3>{e.title}</h3>
              <p>with <b>{e.guest}</b></p>
            </div>
          </article>
        ))}
        <div className="ep-track__end" />
      </div>
    </section>
  )
}
