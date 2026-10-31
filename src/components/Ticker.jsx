const items = ['BUSINESS', 'FINANCE', 'CRYPTO', 'TECHNOLOGY', 'ENTREPRENEURSHIP', 'MARKETS', 'LEADERSHIP', 'INVESTING']
const quotes = [['DMP', '+24 EPS'], ['FINANCE', '▲ 12.4%'], ['CRYPTO', '▲ 8.1%'], ['TECH', '▲ 5.7%'], ['STARTUPS', '▲ 19.2%'], ['GUESTS', '+60']]

export default function Ticker() {
  const row = [...items, ...items]
  const q = [...quotes, ...quotes, ...quotes]
  return (
    <section id="ticker" className="ticker">
      <div className="ticker__row ticker__row--big">
        <div className="ticker__track">
          {row.map((t, i) => <span key={i}>{t}<em>✦</em></span>)}
        </div>
      </div>
      <div className="ticker__row ticker__row--small">
        <div className="ticker__track ticker__track--rev">
          {q.map(([a, b], i) => <span key={i}><b>{a}</b> <i>{b}</i></span>)}
        </div>
      </div>
    </section>
  )
}
