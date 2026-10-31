import { useState } from 'react'
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
import { useCollection } from '../hooks/useCollection'
import { useReveal } from '../hooks/useReveal'

export default function Home() {
  const { items: episodes } = useCollection('episodes', 'number')
  const { items: shows } = useCollection('shows')
  const { items: guests } = useCollection('guests')
  const { items: partners } = useCollection('partners')
  const [playing, setPlaying] = useState(null)
  useReveal([episodes.length, shows.length, guests.length, partners.length])

  const featured = episodes.find((e) => e.featured) || episodes[0]

  return (
    <>
      <Loader />
      <Cursor />
      <div className="noise" aria-hidden />
      <Navbar />
      <main>
        <Hero episodes={episodes} onPlay={setPlaying} />
        <Ticker />
        <Stats episodes={episodes.length} guests={guests.length} />
        <Featured episode={featured} onPlay={setPlaying} />
        <Episodes episodes={episodes} onPlay={setPlaying} />
        <Shows shows={shows} />
        <Guests guests={guests} />
        <About />
        <Partners partners={partners} />
        <Contact />
      </main>
      <Footer />
      <PlayerModal episode={playing} onClose={() => setPlaying(null)} />
    </>
  )
}
