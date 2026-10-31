export default function Brand({ brand, suffix }) {
  return (
    <span className="nav__brand">
      {brand.logoImage ? <img className="nav__logoimg" src={brand.logoImage} alt={brand.logoText} /> : <span className="nav__logo">{brand.logoText}</span>}
      <span className="nav__name">{suffix || brand.name}</span>
    </span>
  )
}

// Splits a sentence and wraps the gold word
export function GoldWords({ text = '', gold = '', className = 'gold-text' }) {
  return text.split(' ').map((w, i, arr) => (
    <span key={i}>{gold && w.replace(/[.,!]/g, '') === gold ? <span className={className}>{w}</span> : w}{i < arr.length - 1 ? ' ' : ''}</span>
  ))
}
