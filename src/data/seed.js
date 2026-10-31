// Demo content — shown until Firestore has data. Admin panel can upload this to Firestore in one click.
export const seed = {
  episodes: [
    { title: 'The Future of Money in East Africa', guest: 'Amina Warsame', role: 'Fintech Founder', category: 'Finance', duration: '58 min', number: 24, featured: true, image: '', youtube: '', description: 'How mobile money, digital banks and stablecoins are rewriting the way Somalis and East Africans save, send and invest.' },
    { title: 'Building a Brand From Mogadishu to the World', guest: 'Hassan Abdi', role: 'CEO, Horizon Group', category: 'Business', duration: '46 min', number: 23, image: '', youtube: '', description: 'Lessons on scaling a local company into an international brand.' },
    { title: 'Crypto Without the Hype', guest: 'Layla Nur', role: 'Blockchain Analyst', category: 'Crypto', duration: '52 min', number: 22, image: '', youtube: '', description: 'What is real, what is noise, and how to protect yourself.' },
    { title: 'AI & the Next Generation of Founders', guest: 'Omar Farah', role: 'Tech Investor', category: 'Technology', duration: '41 min', number: 21, image: '', youtube: '', description: 'Where artificial intelligence creates opportunity for young entrepreneurs.' },
    { title: 'Reading the Markets Like a Pro', guest: 'Sagal Ahmed', role: 'Portfolio Manager', category: 'Markets', duration: '63 min', number: 20, image: '', youtube: '', description: 'Risk, discipline and long-term thinking in global markets.' },
    { title: 'From Side Hustle to Startup', guest: 'Yusuf Ali', role: 'Serial Entrepreneur', category: 'Entrepreneurship', duration: '49 min', number: 19, image: '', youtube: '', description: 'The real story behind three companies and two failures.' },
  ],
  shows: [
    { title: 'Market Talk', icon: '📈', description: 'Weekly breakdown of global and regional markets.', color: '#d4af37' },
    { title: 'Founder Stories', icon: '🚀', description: 'Raw, honest conversations with founders and CEOs.', color: '#e9c46a' },
    { title: 'Crypto Desk', icon: '🪙', description: 'Blockchain, digital assets and Web3 — explained clearly.', color: '#f4d58d' },
    { title: 'Tech Forward', icon: '🤖', description: 'AI, software and the technologies shaping tomorrow.', color: '#c9a227' },
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
    { name: 'Barakaat' }, { name: 'Sabah Visions' }, { name: 'Horizon Group' }, { name: 'Nomad Capital' },
    { name: 'Hormuud Tech' }, { name: 'East Africa Fund' }, { name: 'Golden Media' },
  ],
}
