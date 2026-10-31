import SectionHead from './SectionHead'
import StudioScene from './StudioScene'

export default function About({ about, head }) {
  return (
    <section id="about" className="section container about">
      <div className="about__media" data-reveal>
        <div className="about__frame">{about.image ? <img src={about.image} alt="About" className="about__img" /> : <StudioScene hue={215} />}</div>
        {about.badgeTitle && <div className="about__badge"><strong>{about.badgeTitle}</strong><span>{about.badgeSubtitle}</span></div>}
      </div>
      <div className="about__body">
        <SectionHead {...head} />
        <p data-reveal>{about.text}</p>
        {about.values?.length > 0 && (
          <div className="values">
            {about.values.map((v, i) => (
              <div key={i} className="value" data-reveal style={{ transitionDelay: `${i * 0.1}s` }}><b>{v.title}</b><p>{v.text}</p></div>
            ))}
          </div>
        )}
        {about.timeline?.length > 0 && (
          <ol className="timeline" style={{ '--cols': Math.min(about.timeline.length, 4) }}>
            {about.timeline.map((t, i) => <li key={i} data-reveal style={{ transitionDelay: `${i * 0.1}s` }}><b>{t.year}</b><span>{t.text}</span></li>)}
          </ol>
        )}
      </div>
    </section>
  )
}
