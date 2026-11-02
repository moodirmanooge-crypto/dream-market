import { useEffect, useState } from 'react'
import Loader from '../components/Loader'
import Cursor from '../components/Cursor'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Ticker from '../components/Ticker'
import Stats from '../components/Stats'
import Featured from '../components/Featured'
import Episodes from '../components/Episodes'
import Shows from '../components/Shows'
import Guests from '../components/Guests'
import Partners from '../components/Partners'
import About from '../components/About'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import PlayerModal from '../components/PlayerModal'
import SponsorCTA from '../components/SponsorCTA'
import LeadMagnet from '../components/LeadMagnet'
import SocialLinks from '../components/SocialLinks'
import Team from '../components/Team'
import VisitorCounter from '../components/VisitorCounter'
import CompetitionsTeaser from '../competitions/CompetitionsTeaser'
import { useCollection } from '../hooks/useCollection'
import { useSettings } from '../hooks/useSettings'
import { useReveal } from '../hooks/useReveal'
import { useTrack } from '../hooks/useTrack'

export default function Home() {
  const s = useSettings()
  const episodes = useCollection('episodes', s.seeded)
  const shows = useCollection('shows', s.seeded)
  const guests = useCollection('guests', s.seeded)
  const partners = useCollection('partners', s.seeded)
  const team = useCollection('team', s.seeded)
  const comps = useCollection('competitions', s.seeded)
  const [playing, setPlaying] = useState(null)
  useTrack('home')
  useReveal([episodes, shows, guests, partners, team, comps, s])
  useEffect(() => { document.title = `${s.brand.name} | ${s.hero.title}` }, [s.brand.name, s.hero.title])

  const featured = episodes.find((e) => e.featured) || episodes[0]
  const sec = s.sections

  return (
    <>
      <Loader text={s.brand.logoText} tag={s.hero.title} />
      <Cursor />
      <div className="noise" aria-hidden />
      <Navbar brand={s.brand} sponsorLabel={s.sponsor.navButton} />
      <SocialLinks social={s.social} variant="rail" />
      <main>
        <Hero episodes={episodes} onPlay={setPlaying} hero={s.hero} social={s.social} />
        <Ticker ticker={s.ticker} />
        <Stats stats={s.stats} />
        <VisitorCounter cfg={s.visitors} />
        <Featured episode={featured} onPlay={setPlaying} head={sec.featured} />
        <Episodes episodes={episodes} onPlay={setPlaying} head={sec.episodes} categories={s.categories} />
        <CompetitionsTeaser comps={comps} head={sec.competitions} />
        {shows.length > 0 && <Shows shows={shows} head={sec.shows} />}
        {guests.length > 0 && <Guests guests={guests} head={sec.guests} />}
        <About about={s.about} head={sec.about} />
        {team.length > 0 && <Team team={team} head={sec.team} />}
        <SponsorCTA sponsor={s.sponsor} />
        {partners.length > 0 && <Partners partners={partners} head={sec.partners} cta={s.partnersCta} />}
        <LeadMagnet nl={s.newsletter} />
        <Contact contact={s.contact} head={sec.contact} social={s.social} />
      </main>
      <Footer footer={s.footer} social={s.social} brand={s.brand} />
      <PlayerModal episode={playing} onClose={() => setPlaying(null)} />
    </>
  )
}
