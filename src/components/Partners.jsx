import SectionHead from './SectionHead'

export default function Partners({ partners }) {
  const row = [...partners, ...partners, ...partners]
  return (
    <section id="partners" className="section section--alt partners-sec">
      <div className="container">
        <SectionHead kicker="Partners & Sponsors" title="Trusted by" gold="brands that build." center />
      </div>
      <div className="logos">
        <div className="logos__track">
          {row.map((p, i) => (
            <div className="logo" key={i}>
              {p.logo ? <img src={p.logo} alt={p.name} /> : <><em>◆</em>{p.name}</>}
            </div>
          ))}
        </div>
      </div>
      <div className="container partners-cta" data-reveal>
        <p>Want your brand in front of the region's sharpest business audience?</p>
        <a className="btn btn--ghost" href="#contact">Become a Partner</a>
      </div>
    </section>
  )
}
