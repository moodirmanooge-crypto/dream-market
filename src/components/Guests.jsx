import { Link } from 'react-router-dom'
import SectionHead from './SectionHead'
import { initials } from './Featured'
import { photoStyle } from './photoFit'

// Guests & sponsored companies — moving carousel managed from Admin → Guests & Companies
export default function Guests({ guests, head }) {
  const loop = guests.length < 6 ? [...guests, ...guests, ...guests, ...guests] : [...guests, ...guests]
  return (
    <section id="guests" className="section">
      <div className="container guests__head"><SectionHead {...head} />{head.button && <Link to="/sponsor#form" className="btn btn--gold btn--lg" data-reveal>{head.button}</Link>}</div>
      <div className="guests">
        <div className="guests__track" style={{ animationDuration: `${Math.max(loop.length * 3, 20)}s` }}>
          {loop.map((g, i) => {
            const Tag = g.link ? 'a' : 'figure'
            return (
              <Tag className={`guest ${g.company ? 'guest--company' : ''} ${g.link ? 'guest--link' : ''}`} key={i}
                {...(g.link ? { href: g.link, target: '_blank', rel: 'noreferrer', 'aria-label': g.name } : {})}>
                <div className="guest__photo">
                  {g.image ? <img src={g.image} alt={g.name} style={g.company ? undefined : photoStyle(g.imageFit)} /> : <span>{initials(g.name)}</span>}
                  <i className="guest__ring" />
                </div>
                <div className="guest__cap"><b>{g.name}</b><small>{g.role}</small>
                  {g.link && <em className="guest__visit">{g.linkLabel || 'Visit'} →</em>}</div>
              </Tag>
            )
          })}
        </div>
      </div>
    </section>
  )
}
