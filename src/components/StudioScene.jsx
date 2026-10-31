// Illustrated podcast studio (used when an episode has no photo). hue shifts per slide.
export default function StudioScene({ hue = 220, label }) {
  return (
    <div className="studio" style={{ '--hue': hue }}>
      <div className="studio__panels">{Array.from({ length: 5 }).map((_, i) => <i key={i} />)}</div>
      <div className="studio__beam studio__beam--l" />
      <div className="studio__beam studio__beam--r" />
      <div className="studio__smoke" />
      <svg className="studio__set" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax meet" aria-hidden>
        <defs>
          <linearGradient id="tbl" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#1d2a4a" /><stop offset="1" stopColor="#0b1020" />
          </linearGradient>
          <radialGradient id="glow"><stop offset="0" stopColor="#ffd77a" /><stop offset="1" stopColor="#ffd77a" stopOpacity="0" /></radialGradient>
        </defs>
        {/* chairs */}
        <rect x="30" y="90" width="70" height="80" rx="18" fill="#0d1428" />
        <rect x="300" y="90" width="70" height="80" rx="18" fill="#0d1428" />
        {/* mics */}
        <g className="studio__mic">
          <line x1="140" y1="150" x2="140" y2="104" stroke="#9aa3b5" strokeWidth="3" />
          <rect x="130" y="76" width="20" height="34" rx="10" fill="#2a2f3c" stroke="#c9a227" strokeWidth="1.5" />
        </g>
        <g className="studio__mic studio__mic--2">
          <line x1="260" y1="150" x2="260" y2="104" stroke="#9aa3b5" strokeWidth="3" />
          <rect x="250" y="76" width="20" height="34" rx="10" fill="#2a2f3c" stroke="#c9a227" strokeWidth="1.5" />
        </g>
        {/* table */}
        <path d="M60 150 L340 150 L370 200 L30 200 Z" fill="url(#tbl)" />
        <path d="M60 150 L340 150" stroke="#d4af37" strokeOpacity=".6" strokeWidth="1.5" />
        <circle cx="200" cy="160" r="40" fill="url(#glow)" opacity=".55" className="studio__lamp" />
        <rect x="186" y="152" width="28" height="10" rx="2" fill="#d4af37" />
      </svg>
      {label && <span className="studio__label">{label}</span>}
    </div>
  )
}
