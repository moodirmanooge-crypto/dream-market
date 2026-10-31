import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StudioScene from './StudioScene'

function ytId(url = '') {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)
  return m ? m[1] : null
}

export default function PlayerModal({ episode, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  const id = episode && ytId(episode.youtube)
  return (
    <AnimatePresence>
      {episode && (
        <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="modal__box" initial={{ y: 60, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
            <div className="modal__video">
              {episode.video ? <video src={episode.video} controls autoPlay playsInline poster={episode.image || undefined} />
                : id ? <iframe src={`https://www.youtube.com/embed/${id}?autoplay=1`} title={episode.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                : <><StudioScene hue={225} /><p className="modal__soon">Video coming soon — stay tuned.</p></>}
            </div>
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
