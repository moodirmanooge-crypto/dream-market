import SectionHead from './SectionHead'

export default function Shows({ shows }) {
  const tilt = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    e.currentTarget.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`
    e.currentTarget.style.setProperty('--mx', `${(x + 0.5) * 100}%`)
    e.currentTarget.style.setProperty('--my', `${(y + 0.5) * 100}%`)
  }
  const reset = (e) => { e.currentTarget.style.transform = '' }
  return (
    <section id="shows" className="section section--alt">
      <div className="container">
        <SectionHead kicker="Our Shows" title="Programs built for" gold="ambitious minds." center
          text="Each show focuses on a different side of the new economy — from global markets to the founders building Africa's future." />
        <div className="shows">
          {shows.map((s, i) => (
            <article key={s.id || s.title} className="show" data-reveal style={{ transitionDelay: `${i * 0.1}s` }} onMouseMove={tilt} onMouseLeave={reset}>
              <span className="show__index">0{i + 1}</span>
              <div className="show__icon">{s.icon || '🎙️'}</div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
              <span className="show__more">Explore →</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
