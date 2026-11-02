import { Link } from 'react-router-dom'
import SectionHead from '../components/SectionHead'
import CompCard from './CompCard'
import { compState } from './util'

// Homepage section: active / upcoming competitions
export default function CompetitionsTeaser({ comps, head }) {
  const order = { live: 0, upcoming: 1, ended: 2 }
  const list = [...comps].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || order[compState(a).phase] - order[compState(b).phase]).slice(0, 3)
  if (!list.length) return null
  return (
    <section id="competitions" className="section cp-teaser">
      <div className="container">
        <div className="episodes__top">
          <SectionHead {...head} />
          <Link to="/competitions" className="btn btn--ghost" data-reveal>All competitions →</Link>
        </div>
        <div className="cp-grid">{list.map((c) => <div key={c.id} data-reveal><CompCard c={c} /></div>)}</div>
      </div>
    </section>
  )
}
