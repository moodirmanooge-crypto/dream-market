import { useEffect, useRef } from 'react'

// Soft gold glow that follows the mouse (desktop only)
export default function Cursor() {
  const ref = useRef(null)
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    let x = 0, y = 0, cx = 0, cy = 0, raf
    const move = (e) => { x = e.clientX; y = e.clientY }
    const loop = () => {
      cx += (x - cx) * 0.12; cy += (y - cy) * 0.12
      if (ref.current) ref.current.style.transform = `translate(${cx}px, ${cy}px)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('mousemove', move)
    loop()
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf) }
  }, [])
  return <div ref={ref} className="cursor-glow" aria-hidden />
}
