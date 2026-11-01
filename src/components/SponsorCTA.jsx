import { Link } from 'react-router-dom'
import { Counter } from './Stats'

// Big homepage band that sends brands / prop firms to /sponsor
export default function SponsorCTA({ sponsor }) {
  return (
    <section id="sponsor" className="sponsor-cta">
      <div className="container sponsor-cta__inner" data-reveal>
        <div className="sponsor-cta__copy">
          <p className="kicker"><span />{sponsor.homeKicker}</p>
          <h2>{sponsor.homeTitle} <span className="gold-text italic">{sponsor.homeGold}</span></h2>
          <p>{sponsor.homeText}</p>
          <div className="sponsor-cta__btns">
            <Link to="/sponsor" className="btn btn--gold btn--xl">{sponsor.primaryButton} <span aria-hidden>→</span></Link>
            <Link to="/sponsor#form" className="btn btn--ghost btn--lg">{sponsor.secondaryButton}</Link>
          </div>
        </div>
        <div className="sponsor-cta__stats">
          {(sponsor.stats || []).map((s, i) => (
            <div key={i} className="sponsor-cta__stat">
              <strong><Counter to={Number(s.value) || 0} suffix={s.suffix || ''} /></strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
