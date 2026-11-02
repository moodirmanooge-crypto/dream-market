import { Link } from 'react-router-dom'
import Brand from '../components/Brand'

export default function SubHeader({ brand, right }) {
  return (
    <header className="nav nav--scrolled">
      <div className="nav__inner container">
        <Link to="/" aria-label="Home"><Brand brand={brand} /></Link>
        <nav className="sub-links">
          <Link to="/">Home</Link>
          <Link to="/competitions">Competitions</Link>
          <Link to="/sponsor">Sponsor</Link>
        </nav>
        {right}
      </div>
    </header>
  )
}
