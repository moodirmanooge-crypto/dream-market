export default function SectionHead({ kicker, title, gold, text, center }) {
  return (
    <div className={`section-head ${center ? 'section-head--center' : ''}`}>
      <p className="kicker" data-reveal><span />{kicker}</p>
      <h2 data-reveal className="reveal-up">
        <span className="ru">{title} {gold && <span className="gold-text italic">{gold}</span>}</span>
      </h2>
      {text && <p className="section-head__text" data-reveal>{text}</p>}
    </div>
  )
}
