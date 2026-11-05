// Original illustrated prize scene: gold trophy, cash notes, coins and medals (pure SVG + CSS animation)
const ini = (n = '') => n.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase()

export default function TrophyArt({ prizes = [], winners = [] }) {
  const p = (i, d) => prizes[i]?.prize || d
  const w = (i) => (winners[i]?.name ? winners[i] : null)
  const hasWinners = [0, 1, 2].some((i) => w(i))
  const Step = ({ i, medal, def }) => (
    <div className={`ta__col ta__col--${i + 1}`}>
      {w(i) && (
        <div className="ta__winner" style={{ animationDelay: `${0.6 + (2 - i) * 0.25}s` }}>
          {i === 0 && <span className="ta__crown">👑</span>}
          <div className="ta__wph">{w(i).photo ? <img src={w(i).photo} alt={w(i).name} /> : <span>{ini(w(i).name)}</span>}</div>
          <b className="ta__wname">{w(i).name}</b>
        </div>
      )}
      <div className={`ta__step ta__step--${i + 1}`}><span>{medal}</span><b>{p(i, def)}</b></div>
    </div>
  )
  return (
    <div className={`ta ${hasWinners ? 'ta--won' : ''}`} aria-hidden>
      <div className="ta__halo" />
      <div className="ta__rays" />
      {['💵', '🪙', '💵', '🪙', '💵', '🪙'].map((e, i) => <span key={i} className={`ta__fly ta__fly--${i}`}>{e}</span>)}
      <svg className="ta__trophy" viewBox="0 0 240 280">
        <defs>
          <linearGradient id="tg" x1="0" x2="1"><stop offset="0" stopColor="#8a6a12" /><stop offset=".35" stopColor="#f6dc8a" /><stop offset=".55" stopColor="#d4af37" /><stop offset="1" stopColor="#7a5c0e" /></linearGradient>
          <linearGradient id="tb" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2a2a2a" /><stop offset="1" stopColor="#0c0c0c" /></linearGradient>
        </defs>
        <path d="M62 40 C20 40 14 70 22 92 C30 116 56 124 72 120" fill="none" stroke="url(#tg)" strokeWidth="12" strokeLinecap="round" />
        <path d="M178 40 C220 40 226 70 218 92 C210 116 184 124 168 120" fill="none" stroke="url(#tg)" strokeWidth="12" strokeLinecap="round" />
        <path d="M58 26 H182 V70 C182 122 152 152 120 156 C88 152 58 122 58 70 Z" fill="url(#tg)" />
        <path d="M74 36 H96 V76 C96 110 108 132 120 140 C100 136 74 112 74 76 Z" fill="#fff6d0" opacity=".45" />
        <rect x="108" y="154" width="24" height="34" fill="url(#tg)" />
        <path d="M84 188 H156 L164 206 H76 Z" fill="url(#tg)" />
        <rect x="62" y="206" width="116" height="46" rx="6" fill="url(#tb)" stroke="#d4af37" strokeWidth="2" />
        <rect x="84" y="220" width="72" height="18" rx="3" fill="url(#tg)" />
        <text x="120" y="233.5" textAnchor="middle" fontSize="11" fontWeight="900" fill="#1a1406" fontFamily="Manrope, Arial">DREAM CUP</text>
        <path d="M120 54 l7 14 15 2 -11 10 3 15 -14 -7 -14 7 3 -15 -11 -10 15 -2 z" fill="#fff8d6" opacity=".9" />
      </svg>
      {hasWinners && <div className="ta__banner">🎉 Winners announced</div>}
      <div className="ta__podium">
        <Step i={1} medal="🥈" def="$150" />
        <Step i={0} medal="🥇" def="$250" />
        <Step i={2} medal="🥉" def="$100" />
      </div>
      <div className="ta__sparkles">{Array.from({ length: 14 }).map((_, i) => <i key={i} style={{ left: `${(i * 41) % 100}%`, top: `${(i * 23) % 80}%`, animationDelay: `${(i % 7) * 0.4}s` }} />)}</div>
    </div>
  )
}
