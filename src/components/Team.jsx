import SectionHead from './SectionHead'
import { initials } from './Featured'

function Photo({ m, big }) {
  return (
    <div className={`tm-photo ${big ? 'tm-photo--big' : ''}`}>
      {m.image ? <img src={m.image} alt={m.name} loading="lazy" /> : <span>{initials(m.name)}</span>}
      <i className="tm-photo__ring" />
    </div>
  )
}

export default function Team({ team, head }) {
  const founder = team.find((m) => m.founder)
  const rest = team.filter((m) => m !== founder)
  return (
    <section id="team" className="section section--alt team">
      <div className="container">
        <SectionHead {...head} center />
        {founder && (
          <article className="tm-founder" data-reveal>
            <Photo m={founder} big />
            <div className="tm-founder__body">
              <span className="chip">{founder.role}</span>
              <h3>{founder.name}</h3>
              {founder.focus && <p className="tm-focus">{founder.focus}</p>}
              {founder.bio && <p className="tm-bio">{founder.bio}</p>}
            </div>
          </article>
        )}
        <div className="tm-grid">
          {rest.map((m, i) => (
            <article key={m.id || m.name} className="tm-card" data-reveal style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
              <Photo m={m} />
              <h3>{m.name}</h3>
              <span className="tm-role">{m.role}</span>
              {m.focus && <p className="tm-focus">{m.focus}</p>}
              {m.bio && <p className="tm-cardbio">{m.bio}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
