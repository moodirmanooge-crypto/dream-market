import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { COL } from '../data/seed'
import { initials } from './participants'

// Live list of everyone who joined a competition (public: name, country, photo — never email, phone or lucky number)
export function useParticipants(compId) {
  const [rows, setRows] = useState([])
  useEffect(() => {
    if (!compId || compId === 'sample') return
    return onSnapshot(query(collection(db, COL.compPublic), where('compId', '==', compId)),
      (s) => setRows(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))), () => {})
  }, [compId])
  return rows
}

function Chip({ r, me, win }) {
  return (
    <div className={`pm__chip ${me ? 'is-me' : ''} ${win ? 'is-win' : ''}`}>
      <div className="pm__ph">{r.photo ? <img src={r.photo} alt="" loading="lazy" /> : <span>{initials(r.name)}</span>}</div>
      <div><b>{r.name}</b><small>{r.country}{win ? ' · 🏆 Winner' : ''}</small></div>
    </div>
  )
}

// Auto-scrolling slider of participants (two rows moving in opposite directions)
export function ParticipantsMarquee({ rows, myRegId, winners = new Set() }) {
  if (rows.length === 0) return null
  const reps = Math.max(2, Math.ceil(12 / rows.length))
  const loop = Array.from({ length: reps }, () => rows).flat()
  const half = rows.length > 6
  const a = half ? loop.filter((_, i) => i % 2 === 0) : loop
  const b = half ? loop.filter((_, i) => i % 2 === 1) : null
  const row = (list, rev) => (
    <div className="pm__row"><div className={`pm__track ${rev ? 'pm__track--rev' : ''}`} style={{ animationDuration: `${Math.max(20, list.length * 2.4)}s` }}>
      {[...list, ...list].map((r, i) => <Chip key={i} r={r} me={r.id === myRegId} win={winners.has(r.id)} />)}
    </div></div>
  )
  return <div className="pm">{row(a, false)}{b && row(b, true)}</div>
}

export default function ParticipantsWall({ comp, myReg }) {
  const rows = useParticipants(comp.id)
  const [all, setAll] = useState(false)
  const winners = new Set((comp.winners || []).map((w) => w?.regId).filter(Boolean))
  const list = all ? rows : rows.slice(0, 18)
  const myRegId = myReg?.regId
  return (
    <section id="participants" className="cpd-sec">
      <div className="cpd-sechead">
        <h2>Participants <span className="pw__count">{rows.length}</span></h2>
        {rows.length > 0 && <span className="cpd-live"><i className="live-dot" /> Live — joined traders</span>}
      </div>
      {rows.length === 0 ? (
        <div className="ep-empty cp-empty"><span>👥</span><b>Be the first to join!</b><small>Registered traders appear here.</small></div>
      ) : (
        <>
          <ParticipantsMarquee rows={rows} myRegId={myRegId} winners={winners} />
          <div className="pw">
            {list.map((r, i) => (
              <div key={r.id} className={`pw__item ${r.id === myRegId ? 'is-me' : ''} ${winners.has(r.id) ? 'is-win' : ''}`} style={{ animationDelay: `${Math.min(i, 18) * 0.05}s` }}>
                {winners.has(r.id) && <span className="pw__crown">🏆</span>}
                <div className="pw__photo">{r.photo ? <img src={r.photo} alt="" loading="lazy" /> : <span>{initials(r.name)}</span>}</div>
                <b>{r.name}</b>
                <small>{r.country}</small>
                {r.id === myRegId
                  ? <span className="pw__num">{myReg?.lucky ? `🍀 Your number: #${myReg.lucky}` : 'You'}</span>
                  : <span className={`pw__num ${r.hasLucky || r.luckyNumber ? '' : 'is-empty'}`}>{r.hasLucky || r.luckyNumber ? '🔒 Number locked' : 'Joined'}</span>}
              </div>
            ))}
          </div>
          {rows.length > 18 && <button className="btn btn--ghost pw__more" onClick={() => setAll(!all)}>{all ? 'Show less' : `Show all ${rows.length} participants`}</button>}
        </>
      )}
    </section>
  )
}
