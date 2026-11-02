import { useRef } from 'react'
import { photoStyle } from '../components/photoFit'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const round = (v) => Math.round(v * 10) / 10

// Drag the photo inside the circle + zoom slider, so faces sit perfectly in the round frame
export default function PhotoPositioner({ image, value, onChange }) {
  const fit = { x: 50, y: 50, zoom: 1, ...(value || {}) }
  const drag = useRef(null)
  const set = (p) => onChange({ ...fit, ...p })

  const down = (e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { sx: e.clientX, sy: e.clientY, x: fit.x, y: fit.y, size: e.currentTarget.offsetWidth }
  }
  const move = (e) => {
    const d = drag.current
    if (!d) return
    const k = 100 / d.size / fit.zoom * 1.4
    set({ x: round(clamp(d.x - (e.clientX - d.sx) * k, 0, 100)), y: round(clamp(d.y - (e.clientY - d.sy) * k, 0, 100)) })
  }
  const up = () => { drag.current = null }
  const nudge = (dx, dy) => set({ x: clamp(fit.x + dx, 0, 100), y: clamp(fit.y + dy, 0, 100) })

  if (!image) return <p className="muted pp-empty">Marka hore sawir upload garee — kadib halkan ayaad ku hagaajin kartaa.</p>

  return (
    <div className="pp">
      <div className="pp__stage">
        <div className="pp__circle" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <img src={image} alt="" draggable="false" style={photoStyle(fit)} />
          <i className="pp__ring" />
          <span className="pp__hint">✋ Jiid</span>
        </div>
        <div className="pp__mini">
          <div className="pp__small"><img src={image} alt="" style={photoStyle(fit)} /></div>
          <small>Sida website-ka uga muuqan doono</small>
        </div>
      </div>
      <label className="pp__zoom">
        <span>🔍 Zoom</span>
        <input type="range" min="1" max="3" step="0.05" value={fit.zoom} onChange={(e) => set({ zoom: Number(e.target.value) })} />
        <b>{Math.round(fit.zoom * 100)}%</b>
      </label>
      <div className="pp__btns">
        <button type="button" onClick={() => nudge(0, 4)} title="Sawirka kor u qaad">⬆ Kor</button>
        <button type="button" onClick={() => nudge(0, -4)} title="Sawirka hoos u dhig">⬇ Hoos</button>
        <button type="button" onClick={() => nudge(4, 0)}>⬅ Bidix</button>
        <button type="button" onClick={() => nudge(-4, 0)}>Midig ➡</button>
        <button type="button" onClick={() => onChange({ x: 50, y: 50, zoom: 1 })}>↺ Reset</button>
      </div>
    </div>
  )
}
