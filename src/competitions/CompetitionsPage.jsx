import { useEffect, useState } from 'react'
import { useSettings } from '../hooks/useSettings'
import { useCollection } from '../hooks/useCollection'
import { useTrack } from '../hooks/useTrack'
import Footer from '../components/Footer'
import SubHeader from './SubHeader'
import CompCard from './CompCard'
import { compState, topPrizes } from './util'
import TrophyArt from './TrophyArt'
import Countdown from './Countdown'
import { initials } from './participants'
import { useParticipants, ParticipantsMarquee } from './ParticipantsWall'
import WinnersCelebration from './WinnersCelebration'
import { Link } from 'react-router-dom'

const TABS = [['active', 'Active & Upcoming'], ['ended', 'History']]

export default function CompetitionsPage() {
  const s = useSettings()
  const comps = useCollection('competitions', s.seeded)
  const [tab, setTab] = useState('active')
  useTrack('competitions')
  useEffect(() => { document.title = `Competitions | ${s.brand.name}`; window.scrollTo(0, 0) }, [s.brand.name])
  const list = comps.filter((c) => (compState(c).phase === 'ended') === (tab === 'ended'))
  const head = s.sections.competitions
  const active = comps.find((c) => c.featured && compState(c).phase !== 'ended') || comps.find((c) => compState(c).phase !== 'ended') || comps[0]
  const people = useParticipants(active?.id)
  const st = active ? compState(active) : {}
  const won = comps.find((c) => (c.winners || []).some((w) => w?.name))

  return (
    <>
      <div className="noise" aria-hidden />
      <SubHeader brand={s.brand} />
      <main className="cp-page">
        {won && <WinnersCelebration comp={won} compact />}
        <section className="cph">
          <div className="hero__bg"><div className="orb orb--1" /><div className="orb orb--2" /><div className="grid-lines" /></div>
          <div className="cp-floaters" aria-hidden>{['🏆', '💰', '📈', '🥇', '💵', '🍀', '📊', '🥈', '💎', '🥉'].map((e, i) => <span key={i} style={{ left: `${(i * 97) % 100}%`, animationDelay: `${i * 1.3}s`, animationDuration: `${12 + (i % 4) * 3}s`, fontSize: `${1.4 + (i % 3) * 0.6}rem` }}>{e}</span>)}</div>
          <div className="container cph__grid">
            <div className="cph__copy">
              <p className="kicker"><span />{head.kicker}</p>
              <h1>{head.title} <span className="gold-text italic">{head.gold}</span></h1>
              <p className="cph__text">{head.text}</p>
              {active && (
                <>
                  <div className="cph__prizes">
                    {topPrizes(active).map((x, i) => <div key={i} className={`cph__prize cph__prize--${i + 1}`}><span>{x.medal}</span><b>{x.prize}</b><small>{x.place}</small></div>)}
                  </div>
                  <div className="cph__btns">
                    {st.canRegister
                      ? <Link to={`/competitions/${active.id}?join=1`} className="btn btn--gold btn--xl">🏆 JOIN FREE NOW →</Link>
                      : <Link to={`/competitions/${active.id}`} className="btn btn--gold btn--xl">View competition →</Link>}
                    <Link to={`/competitions/${active.id}`} className="btn btn--ghost btn--lg">Rules & details</Link>
                  </div>
                  <div className="cph__meta">
                    {people.length > 0 && (
                      <div className="cph__stack">
                        <div>{people.slice(0, 5).map((r) => <i key={r.id}>{r.photo ? <img src={r.photo} alt="" /> : initials(r.name)}</i>)}</div>
                        <span><b>{people.length}</b> trader{people.length === 1 ? '' : 's'} already joined</span>
                      </div>
                    )}
                    {st.target && <Countdown at={st.target.at} text={st.target.text} compact />}
                  </div>
                </>
              )}
            </div>
            <TrophyArt prizes={active?.prizes} winners={(won && won.id === active?.id ? won : active)?.winners || []} />
          </div>
          {active && people.length > 0 && (
            <div className="cph__people">
              <p className="container cp-teaser__label"><i className="live-dot" /> Live — traders who joined {active.name}</p>
              <ParticipantsMarquee rows={people} />
            </div>
          )}
        </section>

        {active && (active.prizes || []).length > 0 && (
          <section className="container cpz">
            <div className="section-head section-head--center"><p className="kicker"><span />Prizes</p><h2>Real cash for the <span className="gold-text italic">top 3 traders.</span></h2>
              <p className="section-head__text">Ranked by profit % — the best three traders at the end of {active.name} win.</p></div>
            <div className="cpz__grid">
              {(active.prizes || []).map((x, i) => (
                <div key={i} className={`cpz__card ${i < 3 ? `cpz__card--${i + 1}` : ''}`} style={{ animationDelay: `${i * 0.12}s` }}>
                  <div className="cpz__medal">{['🥇', '🥈', '🥉'][i] || '🎁'}</div>
                  <small>{x.place}</small>
                  <strong>{x.prize}</strong>
                  <div className="cpz__bills" aria-hidden><span>💵</span><span>💵</span><span>💵</span></div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="container cp-listwrap">
          <div className="chips">{TABS.map(([k, l]) => <button key={k} className={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
          {list.length === 0
            ? <div className="ep-empty cp-empty"><span>🏆</span><b>{tab === 'ended' ? 'No past competitions yet.' : 'New competitions are coming soon.'}</b><small>Join our newsletter to be notified first.</small></div>
            : <div className="cp-grid">{list.map((c) => <CompCard key={c.id} c={c} />)}</div>}
        </section>
      </main>
      <Footer footer={s.footer} social={s.social} brand={s.brand} />
    </>
  )
}
