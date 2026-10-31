// Default content. Shown until the admin saves real content to Firestore.
// Admin → "Seed demo data" uploads all of this in one click.

export const defaultSettings = {
  brand: { logoText: 'DMP', name: 'DREAM MARKET PODCAST', logoImage: '', navButton: 'Listen Now' },
  hero: {
    eyebrow: 'New episode every week',
    title: 'Where Financial Minds Meet.',
    goldWord: 'Minds',
    subtitle: 'Business. Finance. Technology. People.',
    rotatorPrefix: 'Conversations about',
    rotatorWords: ['Finance', 'Crypto', 'Markets', 'Startups', 'Technology', 'Leadership'],
    primaryButton: 'WATCH EPISODES',
    secondaryButton: 'Our Story',
    platformsLabel: 'Available on',
    platforms: ['YouTube', 'Spotify', 'Apple Podcasts'],
    image: '',
    slideBadge: 'sabahvisions',
  },
  ticker: {
    topics: ['BUSINESS', 'FINANCE', 'CRYPTO', 'TECHNOLOGY', 'ENTREPRENEURSHIP', 'MARKETS', 'LEADERSHIP', 'INVESTING'],
    quotes: [
      { label: 'DMP', value: '+24 EPS' }, { label: 'FINANCE', value: '▲ 12.4%' }, { label: 'CRYPTO', value: '▲ 8.1%' },
      { label: 'TECH', value: '▲ 5.7%' }, { label: 'STARTUPS', value: '▲ 19.2%' }, { label: 'GUESTS', value: '+60' },
    ],
  },
  stats: [
    { value: 24, suffix: '+', label: 'Episodes' },
    { value: 60, suffix: '+', label: 'Expert Guests' },
    { value: 250, suffix: 'K', label: 'Monthly Listeners' },
    { value: 18, suffix: '', label: 'Countries Reached' },
  ],
  sections: {
    featured: { kicker: 'Featured Episode', title: 'The conversation', gold: 'everyone is talking about.' },
    episodes: { kicker: 'Latest Episodes', title: 'Fresh talks,', gold: 'every single week.' },
    shows: { kicker: 'Our Shows', title: 'Programs built for', gold: 'ambitious minds.', text: "Each show focuses on a different side of the new economy — from global markets to the founders building Africa's future." },
    guests: { kicker: 'Meet Our Guests', title: 'CEOs, founders &', gold: 'investors.', text: 'The people shaping business and finance — in their own words.' },
    about: { kicker: 'About Dream Market', title: 'More than a podcast —', gold: 'a media company.' },
    partners: { kicker: 'Partners & Sponsors', title: 'Trusted by', gold: 'brands that build.' },
    contact: { kicker: 'Contact', title: "Let's build something", gold: 'together.', text: 'Be a guest, sponsor an episode or partner with Dream Market.' },
  },
  about: {
    text: 'Dream Market Podcast is a premium media brand covering Business, Finance, Crypto, Technology and Entrepreneurship. We sit down with CEOs, founders, investors and educators to unpack how real money and real companies are built.',
    image: '',
    badgeTitle: 'DMP',
    badgeSubtitle: 'Est. 2023',
    values: [
      { title: 'Mission', text: 'Bring world-class business and financial knowledge to Somali and African audiences.' },
      { title: 'Vision', text: "Become the leading media platform where Africa's financial minds meet the world." },
      { title: 'Values', text: 'Honesty, depth and real-world experience — no hype, only insight.' },
    ],
    timeline: [
      { year: '2023', text: 'Idea & first recordings' },
      { year: '2024', text: 'Launched on YouTube & Spotify' },
      { year: '2025', text: 'Shows, partners & live events' },
      { year: '2026', text: 'Going international' },
    ],
  },
  partnersCta: { text: "Want your brand in front of the region's sharpest business audience?", button: 'Become a Partner' },
  contact: {
    email: 'hello@dreammarketpodcast.com',
    phone: '+252 61 000 0000',
    location: 'Mogadishu · Nairobi · Dubai',
    newsletterLabel: 'Weekly newsletter — new episodes & market insights',
    formButton: 'Send Message →',
    subjects: ['Guest request', 'Sponsorship', 'Partnership', 'General'],
  },
  social: { youtube: '', spotify: '', apple: '', instagram: '', tiktok: '', linkedin: '', x: '', facebook: '' },
  footer: { bigText: 'Where Financial Minds Meet.', goldWord: 'Minds', tagline: 'Business. Finance. Technology. People.', copyright: 'Dream Market Podcast. All rights reserved.' },
}

export const seed = {
  episodes: [
    { title: 'The Future of Money in East Africa', guest: 'Amina Warsame', role: 'Fintech Founder', category: 'Finance', duration: '58 min', number: 24, featured: true, showInHero: true, image: '', video: '', youtube: '', description: 'How mobile money, digital banks and stablecoins are rewriting the way Somalis and East Africans save, send and invest.' },
    { title: 'Building a Brand From Mogadishu to the World', guest: 'Hassan Abdi', role: 'CEO, Horizon Group', category: 'Business', duration: '46 min', number: 23, showInHero: true, image: '', video: '', youtube: '', description: 'Lessons on scaling a local company into an international brand.' },
    { title: 'Crypto Without the Hype', guest: 'Layla Nur', role: 'Blockchain Analyst', category: 'Crypto', duration: '52 min', number: 22, showInHero: true, image: '', video: '', youtube: '', description: 'What is real, what is noise, and how to protect yourself.' },
    { title: 'AI & the Next Generation of Founders', guest: 'Omar Farah', role: 'Tech Investor', category: 'Technology', duration: '41 min', number: 21, showInHero: true, image: '', video: '', youtube: '', description: 'Where artificial intelligence creates opportunity for young entrepreneurs.' },
    { title: 'Reading the Markets Like a Pro', guest: 'Sagal Ahmed', role: 'Portfolio Manager', category: 'Markets', duration: '63 min', number: 20, showInHero: true, image: '', video: '', youtube: '', description: 'Risk, discipline and long-term thinking in global markets.' },
    { title: 'From Side Hustle to Startup', guest: 'Yusuf Ali', role: 'Serial Entrepreneur', category: 'Entrepreneurship', duration: '49 min', number: 19, image: '', video: '', youtube: '', description: 'The real story behind three companies and two failures.' },
  ],
  shows: [
    { title: 'Market Talk', icon: '📈', image: '', description: 'Weekly breakdown of global and regional markets.' },
    { title: 'Founder Stories', icon: '🚀', image: '', description: 'Raw, honest conversations with founders and CEOs.' },
    { title: 'Crypto Desk', icon: '🪙', image: '', description: 'Blockchain, digital assets and Web3 — explained clearly.' },
    { title: 'Tech Forward', icon: '🤖', image: '', description: 'AI, software and the technologies shaping tomorrow.' },
  ],
  guests: [
    { name: 'Amina Warsame', role: 'Fintech Founder', image: '' },
    { name: 'Hassan Abdi', role: 'CEO, Horizon Group', image: '' },
    { name: 'Layla Nur', role: 'Blockchain Analyst', image: '' },
    { name: 'Omar Farah', role: 'Tech Investor', image: '' },
    { name: 'Sagal Ahmed', role: 'Portfolio Manager', image: '' },
    { name: 'Yusuf Ali', role: 'Serial Entrepreneur', image: '' },
  ],
  partners: [
    { name: 'Barakaat', logo: '', link: '' }, { name: 'Sabah Visions', logo: '', link: '' }, { name: 'Horizon Group', logo: '', link: '' },
    { name: 'Nomad Capital', logo: '', link: '' }, { name: 'Hormuud Tech', logo: '', link: '' }, { name: 'East Africa Fund', logo: '', link: '' },
    { name: 'Golden Media', logo: '', link: '' },
  ],
}
Object.values(seed).forEach((list) => list.forEach((it, i) => (it.order = i)))

// Firestore collection names (prefixed so they never clash with your other apps)
export const COL = {
  episodes: 'dreamEpisodes',
  shows: 'dreamShows',
  guests: 'dreamGuests',
  partners: 'dreamPartners',
  messages: 'dreamMessages',
  subscribers: 'dreamSubscribers',
  settings: 'dreamSettings',
  sessions: 'dreamAdminSessions',
}
