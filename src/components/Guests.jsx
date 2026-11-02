import SectionHead from './SectionHead'
import { initials } from './Featured'
import { photoStyle } from './photoFit'

export default function Guests({ guests, head }) {
  const loop = [...guests, ...guests]
  return (
    <section id="guests" className="section">
      <div className="container"><SectionHead {...head} /></div>
      <div className="guests">
        <div className="guests__track" style={{ animationDuration: `${Math.max(guests.length * 6, 20)}s` }}>
          {loop.map((g, i) => (
            <figure className="guest" key={i}>
              <div className="guest__photo">
                {g.image ? <img src={g.image} alt={g.name} style={photoStyle(g.imageFit)} /> : <span>{initials(g.name)}</span>}
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
