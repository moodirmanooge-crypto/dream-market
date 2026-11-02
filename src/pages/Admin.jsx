import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, doc, getDoc, getDocs, onSnapshot, setDoc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { COL, seed, defaultSettings } from '../data/seed'
import { adminLogin, adminLogout } from '../admin/adminAuth'
import SettingsEditor from '../admin/SettingsEditor'
import CollectionManager from '../admin/CollectionManager'
import Inbox from '../admin/Inbox'
import Analytics, { useTodayStats } from '../admin/Analytics'
import CompetitionsAdmin from '../competitions/CompetitionsAdmin'

const NAV = [
  { group: 'Guud' },
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'analytics', icon: '📈', label: 'Booqdayaasha' },
  { id: 'competitions', icon: '🏆', label: 'Competitions' },
  { group: 'Bogga (Website content)' },
  { id: 'hero', icon: '🏠', label: 'Logo & Hero', keys: ['brand', 'hero'], help: 'Logo-ga, cinwaanka weyn, qoraalada, badhamada iyo sawirka hero-ga.' },
  { id: 'ticker', icon: '📈', label: 'Ticker & Stats', keys: ['ticker', 'stats', 'visitors'], help: 'Qoraalada socda, tirooyinka iyo booqdayaasha bogga hore ka muuqda (Visitors → show: dami si aad u qariso).' },
  { id: 'sections', icon: '🔤', label: 'Cinwaanada qaybaha', keys: ['sections', 'categories'], help: 'Kicker, cinwaan iyo erayga dahabka ah ee qayb kasta + badhamada Categories (Forex, Finance…) ee Episodes.' },
  { id: 'about', icon: 'ℹ️', label: 'About', keys: ['about'], help: 'Qoraalka, sawirka, Mission/Vision/Values iyo timeline.' },
  { id: 'social', icon: '🔗', label: 'Social Media Links', keys: ['social'], help: 'Ku dheji link-ga buuxa (https://…) ee TikTok, Facebook, YouTube iyo kuwa kale. Kuwa madhan website-ka kama muuqdaan.' },
  { id: 'sponsor', icon: '💼', label: 'Sponsor Page', keys: ['sponsor', 'partnersCta'], help: 'Bogga /sponsor: followers, guulaha (Atlas), packages iyo qaybta Sponsor ee bogga hore.' },
  { id: 'newsletter', icon: '🎓', label: 'Newsletter / Free Course', keys: ['newsletter'], help: 'Sanduuqa "Join Our Newsletter" ee lagu ururiyo magaca iyo email-ka ardayda.' },
  { id: 'contact', icon: '☎️', label: 'Contact', keys: ['contact'], help: 'Email, telefoon iyo goobta.' },
  { id: 'footer', icon: '⬇️', label: 'Footer', keys: ['footer'] },
  { group: 'Xogta (Content)' },
  { id: 'episodes', icon: '🎙', label: 'Episodes', col: true },
  { id: 'shows', icon: '📺', label: 'Shows', col: true },
  { id: 'team', icon: '🧑‍🤝‍🧑', label: 'Team', col: true },
  { id: 'guests', icon: '🏢', label: 'Guests & Companies', col: true },
  { id: 'partners', icon: '🤝', label: 'Partners', col: true },
  { group: 'Sanduuqa' },
  { id: 'messages', icon: '✉️', label: 'Fariimaha', inbox: true },
  { id: 'subscribers', icon: '📬', label: 'Email List (Leads)', inbox: true },
]

export default function Admin() {
  const [admin, setAdmin] = useState(undefined)
  // Always start at the login screen: any previous session is closed when /admin is opened
  useEffect(() => { adminLogout().catch(() => {}).finally(() => setAdmin(null)) }, [])
  useEffect(() => { document.title = 'Admin | Dream Market Podcast' }, [])
  if (admin === undefined) return <div className="adm-center"><div className="adm-spin" /></div>
  if (!admin) return <Login onDone={setAdmin} />
  return <Panel admin={admin} onLogout={async () => { await adminLogout(); setAdmin(null) }} />
}

function Login({ onDone }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try { onDone(await adminLogin(u, p)) } catch (e) {
      setErr(e.code === 'auth/admin-restricted-operation' || e.code === 'auth/operation-not-allowed'
        ? 'Anonymous sign-in ma shidna: Firebase → Authentication → Sign-in method → Anonymous → Enable.' : e.message)
    }
    setBusy(false)
  }
  return (
    <div className="adm-center adm-loginbg">
      <form className="adm-login" onSubmit={submit}>
        <div className="adm-login__logo">DMP</div>
        <h1>Admin Panel</h1>
        <p>Dream Market Podcast</p>
        <label className="adm-field"><span>Username</span><input autoFocus autoComplete="username" value={u} onChange={(e) => setU(e.target.value)} required /></label>
        <label className="adm-field"><span>Password</span>
          <div className="adm-pass"><input type={show ? 'text' : 'password'} autoComplete="current-password" value={p} onChange={(e) => setP(e.target.value)} required />
            <button type="button" onClick={() => setShow(!show)}>{show ? '🙈' : '👁'}</button></div>
        </label>
        <button className="btn btn--gold btn--full btn--lg" disabled={busy}>{busy ? 'Hubinaya…' : 'Gal →'}</button>
        {err && <p className="err">{err}</p>}
        <Link to="/" className="adm-login__back">← Ku noqo website-ka</Link>
      </form>
    </div>
  )
}

function Panel({ admin, onLogout }) {
  const [tab, setTab] = useState(() => sessionStorage.getItem('dmp-admin-tab') || 'dashboard')
  const [menu, setMenu] = useState(false)
  useEffect(() => { try { sessionStorage.setItem('dmp-admin-tab', tab) } catch { /* ignore */ } window.scrollTo(0, 0) }, [tab])
  const item = NAV.find((n) => n.id === tab) || NAV[1]

  return (
    <div className="adm">
      <aside className={`adm-side ${menu ? 'is-open' : ''}`}>
        <div className="adm-side__brand"><span className="nav__logo">DMP</span><span className="nav__name">ADMIN</span></div>
        <nav>
          {NAV.map((n, i) => n.group
            ? <p key={i} className="adm-side__group">{n.group}</p>
            : <button key={n.id} className={tab === n.id ? 'is-on' : ''} onClick={() => { setTab(n.id); setMenu(false) }}><span>{n.icon}</span>{n.label}</button>)}
        </nav>
        <div className="adm-side__foot">
          <div className="adm-user"><span>{admin.username?.[0]?.toUpperCase()}</span><div><b>{admin.username}</b><small>Admin</small></div></div>
          <button className="btn btn--ghost btn--sm btn--full" onClick={onLogout}>Ka bax</button>
        </div>
      </aside>
      {menu && <div className="adm-scrim" onClick={() => setMenu(false)} />}

      <div className="adm-main">
        <header className="adm-top">
          <button className="adm-burger" onClick={() => setMenu(true)} aria-label="Menu">☰</button>
          <b>{item.icon} {item.label}</b>
          <a className="btn btn--ghost btn--sm" href="/" target="_blank" rel="noreferrer">↗ Fiiri website-ka</a>
        </header>
        <div className="adm-content">
          {tab === 'dashboard' && <Dashboard go={setTab} />}
          {tab === 'analytics' && <Analytics />}
          {tab === 'competitions' && <CompetitionsAdmin />}
          {item.keys && <SettingsEditor key={item.id} keys={item.keys} title={item.label} help={item.help} />}
          {item.col && <CollectionManager name={item.id} />}
          {item.inbox && <Inbox name={item.id} />}
        </div>
      </div>
    </div>
  )
}

function Dashboard({ go }) {
  const [counts, setCounts] = useState({})
  const vis = useTodayStats()
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const unsubs = ['episodes', 'shows', 'guests', 'partners', 'team', 'messages', 'subscribers'].map((n) =>
      onSnapshot(collection(db, COL[n]), (s) => setCounts((c) => ({ ...c, [n]: s.size, [`${n}New`]: s.docs.filter((d) => d.data().read === false).length })), () => {}))
    return () => unsubs.forEach((u) => u())
  }, [])

  const seedAll = async () => {
    if (!confirm('Xogta tusaalaha ah ku shub Firestore? (Kaliya qaybaha madhan ayaa la buuxinayaa)')) return
    setBusy(true); setMsg('')
    try {
      const b = writeBatch(db); let n = 0; const flags = {}
      for (const [name, list] of Object.entries(seed)) {
        const existing = await getDocs(collection(db, COL[name]))
        if (existing.empty) list.forEach((it) => { b.set(doc(collection(db, COL[name])), it); n++ })
        flags[name] = true
      }
      const site = await getDoc(doc(db, COL.settings, 'site'))
      if (!site.exists()) { b.set(doc(db, COL.settings, 'site'), { ...defaultSettings, seeded: flags }); n++ }
      else b.set(doc(db, COL.settings, 'site'), { seeded: flags }, { merge: true })
      await b.commit()
      setMsg(n ? `✓ ${n} shay ayaa la shubay.` : 'Wax madhan ma jiro — xogtu horay ayay u jirtay.')
    } catch (e) { setMsg(e.message) }
    setBusy(false)
  }

  // Pushes the latest recommended texts (hero, ticker, section titles) + the 5 new shows to Firestore
  const applyNew = async () => {
    if (!confirm('Hero-ga, ticker-ka, cinwaanada qaybaha iyo Shows-ka waxaa lagu beddelayaa qoraalada cusub ee la taliyay. Ma hubtaa?')) return
    setBusy(true); setMsg('')
    try {
      await setDoc(doc(db, COL.settings, 'site'), { hero: defaultSettings.hero, ticker: defaultSettings.ticker, sections: defaultSettings.sections }, { merge: true })
      const old = await getDocs(collection(db, COL.shows))
      const b = writeBatch(db)
      const keepImg = Object.fromEntries(old.docs.map((d) => [d.data().title, d.data().image]).filter(([, v]) => v))
      old.docs.forEach((d) => b.delete(d.ref))
      seed.shows.forEach((it) => b.set(doc(collection(db, COL.shows)), { ...it, image: keepImg[it.title] || '' }))
      await b.commit()
      setMsg('✓ Qoraalada cusub iyo 5-ta Shows waa la geliyay — fiiri website-ka.')
    } catch (e) { setMsg(e.message) }
    setBusy(false)
  }

  const cards = [
    ['episodes', '🎙', 'Episodes'], ['shows', '📺', 'Shows'], ['guests', '👤', 'Guests'],
    ['partners', '🤝', 'Partners'], ['team', '🧑‍🤝‍🧑', 'Team'], ['messages', '✉️', 'Fariimo'], ['subscribers', '📬', 'Email List'],
  ]
  return (
    <div>
      <div className="adm-pagehead"><div><h2>Ku soo dhawoow 👋</h2><p>Halkan ka maamul dhammaan website-ka Dream Market Podcast.</p></div></div>
      <button className="an-dash" onClick={() => go('analytics')}>
        <div><small>👥 Booqdayaal maanta</small><strong>{(vis.today?.visitors || 0).toLocaleString()}</strong></div>
        <div><small>🔁 Jeer la soo galay maanta</small><strong>{(vis.today?.visits || 0).toLocaleString()}</strong></div>
        <div><small>🌍 Wadarta guud</small><strong>{(vis.total?.visits || 0).toLocaleString()}</strong></div>
        <span>Fiiri faahfaahinta →</span>
      </button>
      <div className="adm-stats">
        {cards.map(([k, ic, l]) => (
          <button key={k} className="adm-stat" onClick={() => go(k)}>
            <span>{ic}</span><strong>{counts[k] ?? '—'}</strong><small>{l}</small>
            {k === 'messages' && counts.messagesNew > 0 && <em>{counts.messagesNew} cusub</em>}
          </button>
        ))}
      </div>
      <div className="adm-card">
        <h3>Bilow degdeg ah</h3>
        <div className="adm-quick">
          <button onClick={() => go('competitions')}>🏆 Competitions</button>
          <button onClick={() => go('episodes')}>+ Episode cusub</button>
          <button onClick={() => go('hero')}>Beddel Hero-ga</button>
          <button onClick={() => go('guests')}>+ Marti cusub</button>
          <button onClick={() => go('social')}>Social links</button>
          <button onClick={() => go('sponsor')}>Sponsor page</button>
        </div>
      </div>
      <div className="adm-card">
        <h3>Xogta tusaalaha</h3>
        <p className="muted">Haddii Firestore madhan yahay, riix si demo content loogu shubo — kadib wax ka beddel.</p>
        <button className="btn btn--ghost" onClick={seedAll} disabled={busy}>{busy ? '…' : '⤓ Seed demo data'}</button>
        <button className="btn btn--gold" style={{ marginLeft: 10 }} onClick={applyNew} disabled={busy}>⟳ Geli qoraalada cusub (Hero + Shows)</button>
        {msg && <p className={msg.startsWith('✓') ? 'ok' : 'err'}>{msg}</p>}
      </div>
    </div>
  )
}

