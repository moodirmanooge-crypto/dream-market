import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { COL } from '../data/seed'
import { initials } from './participants'

// Public list of everyone who joined (name, country, photo, lucky number — no private data)
export default function ParticipantsWall({ comp, myRegId }) {
  const [rows, setRows] = useState([])
  const [all, setAll] = useState(false)
  useEffect(() => {
    if (!comp.id || comp.id === 'sample') return
    return onSnapshot(query(collection(db, COL.compPublic), where('compId', '==', comp.id)),
      (s) => setRows(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))), () => {})
  }, [comp.id])
  const winners = new Set((comp.winners || []).map((w) => w?.regId).filter(Boolean))
  const list = all ? rows : rows.slice(0, 24)
  return (
    <section id="participants" className="cpd-sec">
      <div className="cpd-sechead"><h2>Participants <small className="muted">({rows.length})</small></h2>{rows.length > 0 && <span className="cpd-live"><i className="live-dot" /> Live</span>}</div>
      {rows.length === 0 ? (
        <div className="ep-empty cp-empty"><span>👥</span><b>Be the first to join!</b><small>Registered traders and their lucky numbers appear here.</small></div>
      ) : (
        <>
          <div className="pw">
            {list.map((r, i) => (
              <div key={r.id} className={`pw__item ${r.id === myRegId ? 'is-me' : ''} ${winners.has(r.id) ? 'is-win' : ''}`} style={{ animationDelay: `${Math.min(i, 20) * 0.04}s` }}>
                <div className="pw__photo">{r.photo ? <img src={r.photo} alt="" loading="lazy" /> : <span>{initials(r.name)}</span>}</div>
                <b>{r.name}{r.id === myRegId && <em> (you)</em>}</b>
                <small>{r.country}</small>
                <span className={`pw__num ${r.luckyNumber ? '' : 'is-empty'}`}>{r.luckyNumber ? `🍀 #${r.luckyNumber}` : 'no number yet'}</span>
              </div>
            ))}
          </div>
          {rows.length > 24 && <button className="btn btn--ghost pw__more" onClick={() => setAll(!all)}>{all ? 'Show less' : `Show all ${rows.length} participants`}</button>}
        </>
      )}
    </section>
  )
}
