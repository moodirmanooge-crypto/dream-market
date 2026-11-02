import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { COL } from '../data/seed'
import { useSettings } from '../hooks/useSettings'
import { useCollection } from '../hooks/useCollection'
import { useTrack } from '../hooks/useTrack'
import Footer from '../components/Footer'
import SubHeader from './SubHeader'
import Countdown from './Countdown'
import JoinModal from './JoinModal'
import { StatusPill } from './CompCard'
import { compState, fmtDate, lines, money, pctFmt, rankBoard } from './util'

const SECTIONS = [['overview', 'Overview'], ['join', 'How to Join'], ['rules', 'Rules'], ['leaderboard', 'Leaderboard'], ['prizes', 'Prizes'], ['winners', 'Winners']]
const MEDAL = ['🥇', '🥈', '🥉']

export default function CompetitionDetail() {
  const { id } = useParams()
  const s = useSettings()
  const comps = useCollection('competitions', s.seeded)
  const c = comps.find((x) => x.id === id)
  const [board, setBoard] = useState([])
  const [join, setJoin] = useState(false)
  const [, tick] = useState(0)
  useTrack('competition')
  useEffect(() => { window.scrollTo(0, 0) }, [id])
  useEffect(() => { if (c) document.title = `${c.name} | ${s.brand.name}` }, [c, s.brand.name])
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 30000); return () => clearInterval(t) }, [])
  useEffect(() => {
    if (!id || id === 'sample') return
    return onSnapshot(query(collection(db, COL.board), where('compId', '==', id)), (q) => setBoard(q.docs.map((d) => ({ id: d.id, ...d.data() }))), () => {})
  }, [id])
  const ranked = useMemo(() => rankBoard(board), [board])

  if (!c) {
    return (<><SubHeader brand={s.brand} /><main className="cp-page container cp-missing"><h1>Competition not found</h1><Link to="/competitions" className="btn btn--gold">← All competitions</Link></main></>)
  }
  const st = compState(c)
  const go = (k) => document.getElementById(k)?.scrollIntoView({ behavior: 'smooth' })
  const joinBtn = (big) => st.canRegister
    ? <button className={`btn btn--gold ${big ? 'btn--xl' : 'btn--sm'}`} onClick={() => setJoin(true)}>JOIN THE COMPETITION →</button>
    : <span className={`btn btn--ghost ${big ? 'btn--lg' : 'btn--sm'} is-disabled`}>{st.regLabel}</span>

  return (
    <>
      <div className="noise" aria-hidden />
      <SubHeader brand={s.brand} right={<span className="cp-navcta">{joinBtn(false)}</span>} />
      <main className="cp-page">
        <section className="cpd-hero">
          {c.banner && <img className="cpd-hero__bg" src={c.banner} alt="" />}
          <div className="hero__bg"><div className="orb orb--1" /><div className="grid-lines" /></div>
          <div className="container cpd-hero__inner">
            <div>
              <div className="cpd-tags"><StatusPill st={st} /><span className="cp-pill">{c.type}</span>{c.mode && <span className="cp-pill">{c.mode}</span>}</div>
              <p className="kicker"><span />Dream Market Podcast · Competitions</p>
              <h1>{c.name}</h1>
              <p className="cpd-hero__text">{c.description}</p>
              {c.sponsor && (
                <a className="cpd-sponsor" href={c.sponsorLink || undefined} target="_blank" rel="noreferrer">
                  <small>Sponsored by</small>{c.sponsorLogo ? <img src={c.sponsorLogo} alt={c.sponsor} /> : <b>{c.sponsor}</b>}
                </a>
              )}
              <div className="cpd-hero__btns">{joinBtn(true)}<button className="btn btn--ghost btn--lg" onClick={() => go('leaderboard')}>Live Leaderboard</button></div>
            </div>
            <div className="cpd-panel">
              <div className="cpd-panel__big"><small>Prize pool</small><strong className="gold-text">{c.prizePool || '—'}</strong></div>
              <div className="cpd-panel__grid">
                <div><strong>{st.max ? `${st.reg}/${st.max}` : st.reg}</strong><small>Participants</small></div>
                <div><strong>{c.accountSize || '—'}</strong><small>Account size</small></div>
                <div><strong>{c.entryFee || 'Free'}</strong><small>Entry fee</small></div>
                <div><strong>{c.platform || '—'}</strong><small>Platform</small></div>
              </div>
              {st.max > 0 && <div className="cp-cap"><div className="cp-cap__bar"><i style={{ width: `${Math.min(100, (st.reg / st.max) * 100)}%` }} /></div><small>{Math.max(0, st.max - st.reg)} spots left</small></div>}
              {st.target ? <Countdown at={st.target.at} text={st.target.text} /> : <p className="cpd-ended">🏁 This competition has ended.</p>}
            </div>
          </div>
        </section>

        <nav className="cpd-tabs"><div className="container">{SECTIONS.map(([k, l]) => <button key={k} onClick={() => go(k)}>{l}</button>)}</div></nav>

        <div className="container cpd-body">
          <section id="overview" className="cpd-sec">
            <h2>Overview</h2>
            <div className="cpd-facts">
              {[['Organizer', c.organizer], ['Sponsor', c.sponsor || '—'], ['Type', c.type], ['Mode', c.mode], ['Starts', fmtDate(c.start, true)], ['Ends', fmtDate(c.end, true)],
                ['Registration deadline', fmtDate(c.regDeadline, true)], ['Entry fee', c.entryFee || 'Free'], ['Max participants', st.max || 'Unlimited'], ['Platform', c.platform], ['Account size', c.accountSize], ['Prize pool', c.prizePool]]
                .filter(([, v]) => v).map(([l, v]) => <div key={l}><small>{l}</small><b>{v}</b></div>)}
            </div>
          </section>

          <section id="join" className="cpd-sec">
            <h2>How to Join</h2>
            <ol className="cpd-steps">{lines(c.howToJoin).map((x, i) => <li key={i}><span>{i + 1}</span><p>{x}</p></li>)}</ol>
            <div className="cpd-cta">{joinBtn(true)}</div>
          </section>

          <section id="rules" className="cpd-sec">
            <h2>Rules & Requirements</h2>
            <ul className="cpd-rules">{lines(c.rules).map((x, i) => <li key={i}>{x}</li>)}</ul>
          </section>

          <section id="leaderboard" className="cpd-sec">
            <div className="cpd-sechead"><h2>Live Leaderboard</h2>{ranked.length > 0 && <span className="cpd-live"><i className="live-dot" /> Updated live · ranked by profit %</span>}</div>
            {ranked.length === 0 ? (
              <div className="ep-empty cp-empty"><span>📊</span><b>The leaderboard will appear once trading starts.</b><small>Rankings are based on profit percentage.</small></div>
            ) : (
              <>
                <div className="lb-podium">
                  {ranked.slice(0, 3).map((r, i) => (
                    <div key={r.id} className={`lb-pod lb-pod--${i + 1}`}><span>{MEDAL[i]}</span><b>{r.name}</b><small>{r.country}</small><strong className={r.pct >= 0 ? 'up' : 'down'}>{pctFmt(r.pct)}</strong></div>
                  ))}
                </div>
                <div className="lb-wrap">
                  <table className="lb">
                    <thead><tr><th>Rank</th><th>Trader</th><th>Country</th><th>Start</th><th>Current</th><th>Profit %</th><th>Profit $</th><th>Trades</th></tr></thead>
                    <tbody>
                      {ranked.map((r, i) => (
                        <tr key={r.id} className={r.disqualified ? 'is-dq' : i < 3 ? 'is-top' : ''}>
                          <td><b>{r.disqualified ? 'DQ' : MEDAL[i] || i + 1}</b></td><td><b>{r.name}</b></td><td>{r.country || '—'}</td>
                          <td>{money(r.startBalance)}</td><td>{money(r.currentBalance)}</td>
                          <td className={r.pct >= 0 ? 'up' : 'down'}><b>{pctFmt(r.pct)}</b></td><td className={r.profit >= 0 ? 'up' : 'down'}>{money(r.profit)}</td><td>{r.trades ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          <section id="prizes" className="cpd-sec">
            <h2>Prizes</h2>
            <div className="cpd-prizes">{(c.prizes || []).map((p, i) => (
              <div key={i} className={`cpd-prize ${i < 3 ? 'is-top' : ''}`}><span>{MEDAL[i] || '🎁'}</span><small>{p.place}</small><b>{p.prize}</b></div>
            ))}</div>
          </section>

          <section id="winners" className="cpd-sec">
            <h2>Winners</h2>
            {(c.winners || []).length === 0 ? (
              <div className="ep-empty cp-empty"><span>🏅</span><b>Winners will be announced when the competition ends.</b></div>
            ) : (
              <div className="cpd-winners">{c.winners.map((w, i) => (
                <article key={i} className="cpd-winner">
                  <div className="cpd-winner__photo">{w.photo ? <img src={w.photo} alt={w.name} /> : <span>{MEDAL[i] || '🏆'}</span>}</div>
                  <small>{w.place}</small><h3>{w.name}</h3>
                  <p>{[w.country, w.result].filter(Boolean).join(' · ')}</p>
                  {w.prize && <span className="chip">{w.prize}</span>}
                  {w.certificate && <a className="show__more" href={w.certificate} target="_blank" rel="noreferrer">View certificate →</a>}
                </article>
              ))}</div>
            )}
          </section>
        </div>
      </main>
      <Footer footer={s.footer} social={s.social} brand={s.brand} />
      {join && <JoinModal comp={c} onClose={() => setJoin(false)} />}
    </>
  )
}
