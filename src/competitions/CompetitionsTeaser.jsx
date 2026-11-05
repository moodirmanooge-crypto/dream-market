import { Link } from 'react-router-dom'
import SectionHead from '../components/SectionHead'
import CompCard from './CompCard'
import { compState } from './util'
import WinnersCelebration from './WinnersCelebration'
import { useParticipants, ParticipantsMarquee } from './ParticipantsWall'

// Homepage section: active / upcoming competitions
export default function CompetitionsTeaser({ comps, head }) {
  const order = { live: 0, upcoming: 1, ended: 2 }
  const list = [...comps].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || order[compState(a).phase] - order[compState(b).phase]).slice(0, 3)
  const people = useParticipants(list[0]?.id)
  if (!list.length) return null
  const won = list.find((c) => (c.winners || []).some((w) => w?.name))
  return (
    <>
    {won && <WinnersCelebration comp={won} compact />}
    <section id="competitions" className="section cp-teaser">
      <div className="container">
        <div className="episodes__top">
          <SectionHead {...head} />
          <Link to="/competitions" className="btn btn--ghost" data-reveal>All competitions →</Link>
        </div>
        <div className="cp-grid">{list.map((c) => <div key={c.id} data-reveal><CompCard c={c} /></div>)}</div>
      </div>
      {people.length > 0 && <div className="cp-teaser__people"><p className="container cp-teaser__label"><i className="live-dot" /> {people.length} traders joined {list[0].name}</p><ParticipantsMarquee rows={people} /></div>}
    </section>
    </>
  )
}
