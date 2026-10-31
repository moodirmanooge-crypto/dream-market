import SectionHead from './SectionHead'
import { initials } from './Featured'

export default function Guests({ guests }) {
  const loop = [...guests, ...guests]
  return (
    <section id="guests" className="section">
      <div className="container">
        <SectionHead kicker="Meet Our Guests" title="CEOs, founders &" gold="investors." text="The people shaping business and finance — in their own words." />
      </div>
      <div className="guests">
        <div className="guests__track">
          {loop.map((g, i) => (
            <figure className="guest" key={i}>
              <div className="guest__photo">
                {g.image ? <img src={g.image} alt={g.name} /> : <span>{initials(g.name)}</span>}
                <i className="guest__ring" />
              </div>
              <figcaption><b>{g.name}</b><small>{g.role}</small></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
