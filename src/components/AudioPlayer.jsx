import { useEffect, useRef, useState } from 'react'

const BARS = 56
const heights = Array.from({ length: BARS }, (_, i) => 22 + ((i * 37 + (i % 7) * 13) % 74))
const fmt = (t) => (!isFinite(t) ? '0:00' : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`)

// Voice / podcast player. Plays audio files AND the sound of video files (mp4).
export default function AudioPlayer({ src, title, autoPlay = false, compact = false }) {
  const a = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [d, setD] = useState(0)
  const [rate, setRate] = useState(1)
  const [err, setErr] = useState(false)

  useEffect(() => {
    const el = a.current
    if (!el) return
    const on = (ev, fn) => { el.addEventListener(ev, fn); return () => el.removeEventListener(ev, fn) }
    const offs = [
      on('timeupdate', () => setT(el.currentTime)), on('loadedmetadata', () => setD(el.duration)), on('durationchange', () => setD(el.duration)),
      on('play', () => setPlaying(true)), on('pause', () => setPlaying(false)), on('ended', () => setPlaying(false)), on('error', () => setErr(true)),
    ]
    if (autoPlay) el.play().catch(() => {})
    return () => offs.forEach((f) => f())
  }, [src, autoPlay])

  const toggle = () => { const el = a.current; if (el.paused) el.play().catch(() => setErr(true)); else el.pause() }
  const seek = (e) => { const r = e.currentTarget.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); if (d) a.current.currentTime = p * d }
  const skip = (s) => { a.current.currentTime = Math.min(d || 0, Math.max(0, a.current.currentTime + s)) }
  const cycle = () => { const n = rate === 1 ? 1.5 : rate === 1.5 ? 2 : 1; a.current.playbackRate = n; setRate(n) }
  const pct = d ? t / d : 0

  return (
    <div className={`ap ${playing ? 'is-playing' : ''} ${compact ? 'ap--compact' : ''}`}>
      <audio ref={a} src={src} preload="metadata" playsInline />
      <button className="ap__play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
        {playing
          ? <svg viewBox="0 0 24 24" width="26" height="26"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /></svg>
          : <svg viewBox="0 0 24 24" width="26" height="26"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>}
        {playing && <><i className="ap__ring" /><i className="ap__ring ap__ring--2" /></>}
      </button>
      <div className="ap__main">
        {title && <b className="ap__title">🎧 {title}</b>}
        <div className="ap__wave" onClick={seek} role="slider" aria-label="Seek" aria-valuenow={Math.round(pct * 100)}>
          {heights.map((h, i) => (
            <i key={i} className={i / BARS < pct ? 'is-on' : ''} style={{ height: `${h}%`, animationDelay: `${(i % 9) * 0.07}s` }} />
          ))}
        </div>
        <div className="ap__row">
          <span>{fmt(t)} / {fmt(d)}</span>
          <div className="ap__ctrls">
            <button onClick={() => skip(-15)} aria-label="Back 15 seconds">↺ 15</button>
            <button onClick={() => skip(15)} aria-label="Forward 15 seconds">15 ↻</button>
            <button onClick={cycle}>{rate}×</button>
          </div>
        </div>
        {err && <small className="err">Codka lama furi karo — hubi file-ka (mp3, m4a ama mp4).</small>}
      </div>
    </div>
  )
}
