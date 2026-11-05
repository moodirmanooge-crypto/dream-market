import { useEffect, useRef, useState } from 'react'

/*
  Video player. If `audio` is given, the video is muted and the separate voice track
  plays in perfect sync (play / pause / seek / speed follow the video controls).
*/
export default function MediaVideo({ src, audio, poster, autoPlay = false, className = '' }) {
  const v = useRef(null)
  const a = useRef(null)
  const [sound, setSound] = useState(true)

  useEffect(() => {
    const vid = v.current, aud = a.current
    if (!vid) return
    if (autoPlay) vid.play().catch(() => { vid.muted = true; vid.play().catch(() => {}) })
    if (!aud) return
    const sync = () => { if (Math.abs(aud.currentTime - vid.currentTime) > 0.25) aud.currentTime = vid.currentTime }
    const play = () => { sync(); aud.play().catch(() => {}) }
    const pause = () => aud.pause()
    const seek = () => { aud.currentTime = vid.currentTime }
    const rate = () => { aud.playbackRate = vid.playbackRate }
    // the video itself must stay silent — its volume slider controls the voice track instead
    const vol = () => { aud.volume = vid.volume; if (!vid.muted) { vid.muted = true; aud.muted = false; setSound(true) } }
    const wait = () => aud.pause()
    const go = () => { if (!vid.paused) play() }
    const evs = [['play', play], ['playing', go], ['pause', pause], ['seeked', seek], ['seeking', seek], ['ratechange', rate], ['volumechange', vol], ['waiting', wait], ['timeupdate', sync], ['ended', pause]]
    evs.forEach(([e, f]) => vid.addEventListener(e, f))
    return () => { evs.forEach(([e, f]) => vid.removeEventListener(e, f)); aud.pause() }
  }, [src, audio, autoPlay])

  return (
    <>
      <video ref={v} className={className} src={src} poster={poster || undefined} controls playsInline preload="metadata"
        muted={!!audio} controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} />
      {audio && <audio ref={a} src={audio} preload="auto" />}
      {audio && <button type="button" className="mv__sound" onClick={() => { const m = !a.current.muted; a.current.muted = m; setSound(!m) }} aria-label="Sound">{sound ? '🔊 Sound on' : '🔇 Sound off'}</button>}
    </>
  )
}
