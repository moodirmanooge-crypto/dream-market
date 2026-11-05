import StudioScene from './StudioScene'
import SectionHead from './SectionHead'
import AudioPlayer from './AudioPlayer'
import { useEffect, useRef, useState } from 'react'
import WaveControl from './WaveControl'
import { epMedia } from './media'
import MediaVideo from './MediaVideo'

export default function Featured({ episode, onPlay, head }) {
  if (!episode) return null
  const media = epMedia(episode)
  const voice = media?.kind === 'audio'
  const inline = media?.kind === 'video'
  const [playing, setPlaying] = useState(false)
  const vref = useRef(null)
  useEffect(() => setPlaying(false), [episode?.id, media?.src])
  const start = () => (inline ? setPlaying(true) : onPlay(episode))
  return (
    <section className="section container" id="featured">
      <SectionHead {...head} />
      <article className="featured" data-reveal>
        <div className={`featured__media ${playing ? 'is-playing' : ''}`}>
          {playing ? <MediaVideo className="featured__video" src={media.src} audio={media.audio} poster={episode.image} autoPlay videoRef={vref} />
            : episode.image ? <img src={episode.image} alt={episode.title} /> : <StudioScene hue={230} label="FEATURED" />}
          {playing ? null : voice ? <span className="featured__voice">🎧 Listen</span> : (
          <button className="play-big" onClick={start} aria-label="Play featured">
            <span className="play-big__ring" /><span className="play-big__ring play-big__ring--2" />
            <svg viewBox="0 0 24 24" width="34" height="34"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
          </button>)}
        </div>
        <div className="featured__body">
          {(episode.number || episode.category) && <span className="chip">{[episode.number && `EPISODE ${episode.number}`, episode.category].filter(Boolean).join(' · ')}</span>}
          {episode.title && <h3>{episode.title}</h3>}
          {episode.description && <p>{episode.description}</p>}
          {episode.guest && (
            <div className="featured__guest">
              <div className="avatar">{episode.guestImage ? <img src={episode.guestImage} alt={episode.guest} /> : initials(episode.guest)}</div>
              <div><b>{episode.guest}</b><small>{episode.role}</small></div>
            </div>
          )}
          {voice ? (
            <><AudioPlayer src={media.src} />{episode.duration && <div className="featured__meta"><span>⏱ {episode.duration}</span></div>}</>
          ) : (
            <>
              {inline ? <WaveControl mediaRef={vref} ready={playing} onStart={start} /> : (
                <div className="wave" aria-hidden>
                  {Array.from({ length: 48 }).map((_, i) => <i key={i} style={{ animationDelay: `${(i % 12) * 0.08}s`, height: `${20 + ((i * 37) % 70)}%` }} />)}
                </div>
              )}
              <div className="featured__meta"><span>{episode.duration ? `⏱ ${episode.duration}` : ''}</span>{playing ? <button className="btn btn--ghost" onClick={() => setPlaying(false)}>■ Stop</button> : <button className="btn btn--gold" onClick={start}>▶ Play Now</button>}</div>
            </>
          )}
        </div>
      </article>
    </section>
  )
}

export function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}