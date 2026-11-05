// Original illustrated prize scene: gold trophy, cash notes, coins and medals (pure SVG + CSS animation)
export default function TrophyArt({ prizes = [] }) {
  const p = (i, d) => prizes[i]?.prize || d
  return (
    <div className="ta" aria-hidden>
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
      <div className="ta__podium">
        <div className="ta__step ta__step--2"><span>🥈</span><b>{p(1, '$150')}</b></div>
        <div className="ta__step ta__step--1"><span>🥇</span><b>{p(0, '$250')}</b></div>
        <div className="ta__step ta__step--3"><span>🥉</span><b>{p(2, '$100')}</b></div>
      </div>
      <div className="ta__sparkles">{Array.from({ length: 14 }).map((_, i) => <i key={i} style={{ left: `${(i * 41) % 100}%`, top: `${(i * 23) % 80}%`, animationDelay: `${(i % 7) * 0.4}s` }} />)}</div>
    </div>
  )
}
