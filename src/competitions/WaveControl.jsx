import { useEffect, useState } from 'react'

const BARS = 56
const H = Array.from({ length: BARS }, (_, i) => 22 + ((i * 37 + (i % 7) * 13) % 74))
const fmt = (t) => (!isFinite(t) ? '0:00' : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`)

// Gold waveform that controls a <video> element (play / pause / seek / skip) — the sound plays from the video
export default function WaveControl({ mediaRef, onStart, ready }) {
  const [, force] = useState(0)
  const el = () => mediaRef.current
  useEffect(() => {
    if (!ready) return
    let raf
    const loop = () => { force((n) => n + 1); raf = requestAnimationFrame(loop) }
    const id = setTimeout(loop, 50)
    return () => { clearTimeout(id); cancelAnimationFrame(raf) }
  }, [ready])
  const m = ready ? el() : null
  const t = m?.currentTime || 0, d = m?.duration || 0, playing = m ? !m.paused && !m.ended : false
  const pct = d ? t / d : 0
  const toggle = () => { if (!m) return onStart(); if (m.paused) m.play().catch(() => {}); else m.pause() }
  const seek = (e) => { if (!m) return onStart(); const r = e.currentTarget.getBoundingClientRect(); if (d) m.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * d }
  const skip = (s) => { if (m) m.currentTime = Math.max(0, Math.min(d, m.currentTime + s)) }
  return (
    <div className={`ap ${playing ? 'is-playing' : ''}`}>
      <button className="ap__play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? <svg viewBox="0 0 24 24" width="26" height="26"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /></svg>
          : <svg viewBox="0 0 24 24" width="26" height="26"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>}
        {playing && <><i className="ap__ring" /><i className="ap__ring ap__ring--2" /></>}
      </button>
      <div className="ap__main">
        <div className="ap__wave" onClick={seek} role="slider" aria-label="Seek" aria-valuenow={Math.round(pct * 100)}>
          {H.map((h, i) => <i key={i} className={i / BARS < pct ? 'is-on' : ''} style={{ height: `${h}%`, animationDelay: `${(i % 9) * 0.07}s` }} />)}
        </div>
        <div className="ap__row">
          <span>{fmt(t)} / {fmt(d)}</span>
          <div className="ap__ctrls"><button onClick={() => skip(-15)}>↺ 15</button><button onClick={() => skip(15)}>15 ↻</button></div>
        </div>
      </div>
    </div>
  )
}