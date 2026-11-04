import { initials } from './participants'

const MEDAL = ['🥇', '🥈', '🥉']
const COLORS = ['#d4af37', '#f2d27a', '#fff3c4', '#3ddc84', '#ff6b6b', '#6ea8ff']

// Animated podium for the 3 winners chosen by the admin
export default function WinnersCelebration({ comp, compact = false }) {
  const w = (comp.winners || []).filter((x) => x && x.name).slice(0, 3)
  if (!w.length) return null
  const order = w.length === 3 ? [1, 0, 2] : w.map((_, i) => i)
  return (
    <section className={`wc ${compact ? 'wc--compact' : ''}`} aria-label="Winners">
      <div className="wc__confetti" aria-hidden>
        {Array.from({ length: 60 }).map((_, i) => (
          <i key={i} style={{ left: `${(i * 53) % 100}%`, background: COLORS[i % COLORS.length], animationDelay: `${(i % 15) * 0.35}s`, animationDuration: `${4 + (i % 5)}s`, width: i % 3 ? 8 : 12, height: i % 3 ? 14 : 8 }} />
        ))}
      </div>
      <div className="wc__rays" aria-hidden />
      <div className="container wc__inner">
        <p className="wc__kicker">🏆 {comp.name}</p>
        <h2 className="wc__title"><span className="gold-text">Congratulations</span> to our winners!</h2>
        <div className="wc__podium">
          {order.map((i) => {
            const x = w[i]
            return (
              <article key={i} className={`wc__p wc__p--${i + 1}`} style={{ animationDelay: `${0.25 + (2 - i) * 0.25}s` }}>
                {i === 0 && <span className="wc__crown">👑</span>}
                <div className="wc__photo">
                  {x.photo ? <img src={x.photo} alt={x.name} /> : <span>{initials(x.name)}</span>}
                  <i className="wc__glow" />
                </div>
                <span className="wc__medal">{MEDAL[i]}</span>
                <h3>{x.name}</h3>
                <small>{[x.country, x.result].filter(Boolean).join(' · ')}</small>
                {x.prize && <b className="wc__prize">{x.prize}</b>}
                <div className="wc__step"><span>{i + 1}</span></div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
