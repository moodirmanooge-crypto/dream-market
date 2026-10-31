import { useEffect, useRef, useState } from 'react'

function Counter({ to, suffix = '' }) {
  const [n, setN] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const tick = (t) => {
        const p = Math.min((t - start) / 1800, 1)
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    ref.current && io.observe(ref.current)
    return () => io.disconnect()
  }, [to])
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>
}

export default function Stats({ episodes, guests }) {
  const data = [
    { v: Math.max(episodes, 24), s: '+', l: 'Episodes' },
    { v: Math.max(guests, 60), s: '+', l: 'Expert Guests' },
    { v: 250, s: 'K', l: 'Monthly Listeners' },
    { v: 18, s: '', l: 'Countries Reached' },
  ]
  return (
    <section className="stats container">
      {data.map((d, i) => (
        <div className="stat" key={d.l} data-reveal style={{ transitionDelay: `${i * 0.1}s` }}>
          <strong><Counter to={d.v} suffix={d.s} /></strong>
          <span>{d.l}</span>
        </div>
      ))}
    </section>
  )
}
