export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__big" data-reveal>Where Financial <span className="gold-text italic">Minds</span> Meet.</div>
        <div className="footer__grid">
          <div>
            <div className="nav__brand"><span className="nav__logo">DMP</span><span className="nav__name">DREAM MARKET PODCAST</span></div>
            <p>Business. Finance. Technology. People.</p>
          </div>
          <div><b>Explore</b>{['About', 'Shows', 'Episodes', 'Guests'].map((l) => <a key={l} href={`#${l.toLowerCase()}`}>{l}</a>)}</div>
          <div><b>Listen</b><a href="#episodes">YouTube</a><a href="#episodes">Spotify</a><a href="#episodes">Apple Podcasts</a></div>
          <div><b>Follow</b><a href="#contact">Instagram</a><a href="#contact">TikTok</a><a href="#contact">LinkedIn</a><a href="#contact">X</a></div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Dream Market Podcast. All rights reserved.</span>
          <a href="#/admin">Admin</a>
        </div>
      </div>
    </footer>
  )
}
