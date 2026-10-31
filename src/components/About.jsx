import SectionHead from './SectionHead'
import StudioScene from './StudioScene'

const values = [
  { t: 'Mission', d: 'Bring world-class business and financial knowledge to Somali and African audiences.' },
  { t: 'Vision', d: 'Become the leading media platform where Africa\'s financial minds meet the world.' },
  { t: 'Values', d: 'Honesty, depth and real-world experience — no hype, only insight.' },
]
const timeline = [['2023', 'Idea & first recordings'], ['2024', 'Launched on YouTube & Spotify'], ['2025', 'Shows, partners & live events'], ['2026', 'Going international']]

export default function About() {
  return (
    <section id="about" className="section container about">
      <div className="about__media" data-reveal>
        <div className="about__frame"><StudioScene hue={215} /></div>
        <div className="about__badge"><strong>DMP</strong><span>Est. 2023</span></div>
      </div>
      <div className="about__body">
        <SectionHead kicker="About Dream Market" title="More than a podcast —" gold="a media company." />
        <p data-reveal>Dream Market Podcast is a premium media brand covering Business, Finance, Crypto, Technology and Entrepreneurship. We sit down with CEOs, founders, investors and educators to unpack how real money and real companies are built.</p>
        <div className="values">
          {values.map((v, i) => (
            <div key={v.t} className="value" data-reveal style={{ transitionDelay: `${i * 0.1}s` }}><b>{v.t}</b><p>{v.d}</p></div>
          ))}
        </div>
        <ol className="timeline">
          {timeline.map(([y, t], i) => <li key={y} data-reveal style={{ transitionDelay: `${i * 0.1}s` }}><b>{y}</b><span>{t}</span></li>)}
        </ol>
      </div>
    </section>
  )
}
