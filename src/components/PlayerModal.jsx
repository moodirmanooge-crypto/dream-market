import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StudioScene from './StudioScene'
import AudioPlayer from './AudioPlayer'
import { epMedia } from './media'
import MediaVideo from './MediaVideo'

export default function PlayerModal({ episode, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  const m = episode && epMedia(episode)
  return (
    <AnimatePresence>
      {episode && (
        <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="modal__box" initial={{ y: 60, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
            {m?.kind === 'audio' ? (
              <div className="modal__audio">
                <div className="modal__cover">{episode.image ? <img src={episode.image} alt="" /> : <StudioScene hue={225} />}</div>
                <AudioPlayer src={m.src} autoPlay />
              </div>
            ) : (
              <div className="modal__video">
                {m?.kind === 'video' ? <MediaVideo src={m.src} audio={m.audio} poster={episode.image} autoPlay />
                  : m?.kind === 'youtube' ? <iframe src={`https://www.youtube.com/embed/${m.id}?autoplay=1`} title={episode.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                  : <><StudioScene hue={225} /><p className="modal__soon">Coming soon — stay tuned.</p></>}
              </div>
            )}
            <div className="modal__info">
              <span className="chip">EP {episode.number} · {episode.category}</span>
              <h3>{episode.title}</h3>
              <p>with <b>{episode.guest}</b>{episode.role ? ` — ${episode.role}` : ''} · {episode.duration}</p>
              {episode.description && <p className="muted">{episode.description}</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
