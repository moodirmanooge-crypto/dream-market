import { Link } from 'react-router-dom'
import Brand, { GoldWords } from './Brand'
import SocialLinks from './SocialLinks'

const SOCIAL = [['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['linkedin', 'LinkedIn'], ['x', 'X'], ['facebook', 'Facebook']]
const LISTEN = [['youtube', 'YouTube'], ['spotify', 'Spotify'], ['apple', 'Apple Podcasts']]

export default function Footer({ footer, social, brand }) {
  const ext = (url, label) => <a key={label} href={url || '#contact'} {...(url ? { target: '_blank', rel: 'noreferrer' } : {})}>{label}</a>
  const follow = SOCIAL.filter(([k]) => social[k])
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__big" data-reveal><GoldWords text={footer.bigText} gold={footer.goldWord} className="gold-text italic" /></div>
        <div className="footer__grid">
          <div><Brand brand={brand} /><p>{footer.tagline}</p><SocialLinks social={social} /></div>
          <div><b>Explore</b>{['About', 'Shows', 'Episodes', 'Guests'].map((l) => <a key={l} href={`#${l.toLowerCase()}`}>{l}</a>)}</div>
          <div><b>Listen</b>{LISTEN.map(([k, l]) => ext(social[k], l))}</div>
          <div><b>Follow</b>{(follow.length ? follow : SOCIAL.slice(0, 4)).map(([k, l]) => ext(social[k], l))}</div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} {footer.copyright}</span>
          <Link to="/sponsor">Sponsor Us</Link>
          <Link to="/admin">Admin</Link>
        </div>
      </div>
    </footer>
  )
}
