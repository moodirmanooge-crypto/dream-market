import { Link, useNavigate } from 'react-router-dom'
import { compState, fmtDate } from './util'

export function StatusPill({ st }) {
  return <span className={`cp-pill cp-pill--${st.canRegister ? 'open' : st.phase}`}>{st.phase === 'live' && <i className="live-dot" />}{st.canRegister ? st.regLabel : st.label}</span>
}

export default function CompCard({ c }) {
  const st = compState(c)
  const nav = useNavigate()
  const fill = st.max ? Math.min(100, (st.reg / st.max) * 100) : 0
  return (
    <Link to={`/competitions/${c.id}`} className="cp-card">
      <div className="cp-card__media">
        {c.banner ? <img src={c.banner} alt="" /> : <div className="cp-card__art"><span>🏆</span></div>}
        <StatusPill st={st} />
        <span className="cp-card__type">{c.type}</span>
      </div>
      <div className="cp-card__body">
        <h3>{c.name}</h3>
        <p className="cp-card__dates">{fmtDate(c.start)} – {fmtDate(c.end)}</p>
        <div className="cp-card__stats">
          <div><strong>{c.prizePool || '—'}</strong><small>Prize pool</small></div>
          <div><strong>{c.accountSize || '—'}</strong><small>Account</small></div>
          <div><strong>{c.entryFee || 'Free'}</strong><small>Entry</small></div>
        </div>
        {st.max > 0 && (
          <div className="cp-cap"><div className="cp-cap__bar"><i style={{ width: `${fill}%` }} /></div><small>{st.reg} / {st.max} traders</small></div>
        )}
        {c.sponsor && <p className="cp-card__sponsor">Sponsored by <b>{c.sponsor}</b></p>}
        {st.canRegister
          ? <button type="button" className="btn btn--gold btn--full cp-card__join" onClick={(e) => { e.preventDefault(); nav(`/competitions/${c.id}?join=1`) }}>🏆 JOIN NOW</button>
          : <span className="cp-card__cta">{st.phase === 'ended' ? 'See results →' : 'View details →'}</span>}
      </div>
    </Link>
  )
}
