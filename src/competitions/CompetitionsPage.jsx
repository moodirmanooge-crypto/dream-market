import { useEffect, useState } from 'react'
import { useSettings } from '../hooks/useSettings'
import { useCollection } from '../hooks/useCollection'
import { useTrack } from '../hooks/useTrack'
import Footer from '../components/Footer'
import SubHeader from './SubHeader'
import CompCard from './CompCard'
import { compState } from './util'
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
  const won = comps.find((c) => (c.winners || []).some((w) => w?.name))

  return (
    <>
      <div className="noise" aria-hidden />
      <SubHeader brand={s.brand} />
      <main className="cp-page">
        {won && <WinnersCelebration comp={won} compact />}
        <section className="sp-hero cp-hero">
          <div className="hero__bg"><div className="orb orb--1" /><div className="orb orb--2" /><div className="grid-lines" /></div>
          <div className="cp-floaters" aria-hidden>{['🏆', '💰', '📈', '🥇', '💵', '🍀', '📊', '🥈', '💎', '🥉'].map((e, i) => <span key={i} style={{ left: `${(i * 97) % 100}%`, animationDelay: `${i * 1.3}s`, animationDuration: `${12 + (i % 4) * 3}s`, fontSize: `${1.4 + (i % 3) * 0.6}rem` }}>{e}</span>)}</div>
          <div className="container">
            <p className="kicker"><span />{head.kicker}</p>
            <h1>{head.title} <span className="gold-text italic">{head.gold}</span></h1>
            <p className="sp-hero__text">{head.text}</p>
          </div>
        </section>
        {active && people.length > 0 && (
          <section className="cp-people">
            <div className="container cp-people__head">
              <div><p className="kicker"><span />Live participants</p><h2><span className="gold-text">{people.length}</span> traders already joined {active.name}</h2></div>
              <Link to={`/competitions/${active.id}`} className="btn btn--gold">Join them →</Link>
            </div>
            <ParticipantsMarquee rows={people} />
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
