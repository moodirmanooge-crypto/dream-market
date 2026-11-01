import { Link } from 'react-router-dom'
import SectionHead from './SectionHead'

export default function Partners({ partners, head, cta }) {
  const row = [...partners, ...partners, ...partners]
  return (
    <section id="partners" className="section section--alt partners-sec">
      <div className="container"><SectionHead {...head} center /></div>
      <div className="logos">
        <div className="logos__track">
          {row.map((p, i) => {
            const inner = p.logo ? <img src={p.logo} alt={p.name} /> : <><em>◆</em>{p.name}</>
            return p.link
              ? <a className="logo" key={i} href={p.link} target="_blank" rel="noreferrer">{inner}</a>
              : <div className="logo" key={i}>{inner}</div>
          })}
        </div>
      </div>
      <div className="container partners-cta" data-reveal>
        <p>{cta.text}</p>
        {cta.button && <Link className="btn btn--gold" to="/sponsor">{cta.button}</Link>}
      </div>
    </section>
  )
}
