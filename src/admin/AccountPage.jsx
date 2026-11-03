import { useState } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { COL } from '../data/seed'

// Change the admin login (email / username + password) stored in Firestore "admin-dream"
export default function AccountPage({ admin, onLogout }) {
  const [f, setF] = useState({ current: '', username: admin?.username || '', password: '', confirm: '' })
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const save = async (e) => {
    e.preventDefault(); setMsg('')
    const username = f.username.trim()
    const password = f.password || f.current
    if (username.length < 3) return setMsg('Username / email-ku waa inuu ka badnaadaa 3 xaraf.')
    if (f.password && f.password.length < 6) return setMsg('Password-ka cusub waa inuu ahaadaa ugu yaraan 6 xaraf.')
    if (f.password !== f.confirm) return setMsg('Labada password ee cusub isma laha.')
    setBusy(true)
    try {
      const s = await getDoc(doc(db, COL.sessions, auth.currentUser.uid))
      const sess = s.data() || {}
      if (sess.password !== f.current) { setBusy(false); return setMsg('Password-ka hadda (current) waa khalad.') }
      await updateDoc(doc(db, 'admin-dream', sess.adminId), { username, password })
      setMsg('✓ Waa la beddelay! Hadda ku gal email-ka / password-ka cusub…')
      setTimeout(onLogout, 2200)
    } catch (err) {
      setMsg(err.code === 'permission-denied' ? 'Firestore rules: ku dheji firestore.rules (qaybta DREAM) → Publish, kadib mar kale isku day.' : err.message)
    }
    setBusy(false)
  }

  return (
    <div>
      <div className="adm-pagehead"><div><h2>👤 Akoonkaaga (Login)</h2><p>Beddel email-ka / username-ka iyo password-ka aad admin-ka ku gasho.</p></div></div>
      <form className="adm-card acc" onSubmit={save}>
        <label className="adm-field"><span>Password-ka hadda *</span><input type={show ? 'text' : 'password'} required autoComplete="current-password" value={f.current} onChange={set('current')} /></label>
        <label className="adm-field"><span>Email / Username cusub</span><input autoComplete="username" value={f.username} onChange={set('username')} placeholder="dreammarketpodcast@gmail.com" /></label>
        <div className="ca-grid">
          <label className="adm-field"><span>Password cusub</span><input type={show ? 'text' : 'password'} autoComplete="new-password" value={f.password} onChange={set('password')} placeholder="ka tag madhan haddii aanad beddelayn" /></label>
          <label className="adm-field"><span>Ku celi password-ka cusub</span><input type={show ? 'text' : 'password'} autoComplete="new-password" value={f.confirm} onChange={set('confirm')} /></label>
        </div>
        <label className="adm-check"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /><span>👁 Muuji password-ka</span></label>
        <button className="btn btn--gold btn--lg" disabled={busy}>{busy ? 'Kaydinaya…' : '💾 Kaydi login-ka cusub'}</button>
        {msg && <p className={msg.startsWith('✓') ? 'ok' : 'err'}>{msg}</p>}
        <p className="muted acc__note">Kadib marka la kaydiyo, waa lagaa saarayaa admin-ka si aad ugu gasho login-ka cusub.</p>
      </form>
    </div>
  )
}
