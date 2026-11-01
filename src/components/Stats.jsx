import { useEffect, useRef, useState } from 'react'

export function Counter({ to, suffix = '' }) {
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

export default function Stats({ stats = [] }) {
  if (!stats.length) return null
  return (
    <section className="stats container" style={{ '--cols': Math.min(stats.length, 4) }}>
      {stats.map((d, i) => (
        <div className="stat" key={i} data-reveal style={{ transitionDelay: `${i * 0.1}s` }}>
          <strong><Counter to={Number(d.value) || 0} suffix={d.suffix || ''} /></strong>
          <span>{d.label}</span>
        </div>
      ))}
    </section>
  )
}
