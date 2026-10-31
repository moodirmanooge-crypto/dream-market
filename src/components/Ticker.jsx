export default function Ticker({ ticker }) {
  const topics = ticker.topics || []
  const quotes = ticker.quotes || []
  const row = [...topics, ...topics]
  const q = [...quotes, ...quotes, ...quotes]
  return (
    <section id="ticker" className="ticker">
      {topics.length > 0 && (
        <div className="ticker__row ticker__row--big">
          <div className="ticker__track">{row.map((t, i) => <span key={i}>{t}<em>✦</em></span>)}</div>
        </div>
      )}
      {quotes.length > 0 && (
        <div className="ticker__row ticker__row--small">
          <div className="ticker__track ticker__track--rev">{q.map((x, i) => <span key={i}><b>{x.label}</b> <i>{x.value}</i></span>)}</div>
        </div>
      )}
    </section>
  )
}
