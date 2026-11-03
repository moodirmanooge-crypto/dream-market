import { useEffect, useState } from 'react'
import { collection, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { COL } from '../data/seed'
import { enableOnThisDevice, myToken, permission, removeToken, ring, setSoundOn, showLocal, soundOn, supported, TOKENS } from './notify'

const PERM = { granted: ['🟢', 'La oggolaaday'], denied: ['🔴', 'La diiday — browser settings ka fur'], default: ['🟡', 'Weli lama oggolaan'], unsupported: ['⚪', 'Browser-kan ma taageero'] }

export default function NotificationsPage({ admin }) {
  const [perm, setPerm] = useState(permission())
  const [vapid, setVapid] = useState('')
  const [savedVapid, setSavedVapid] = useState('')
  const [devices, setDevices] = useState([])
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [sound, setSound] = useState(soundOn())
  const mine = myToken()

  useEffect(() => { getDoc(doc(db, COL.settings, 'site')).then((d) => { const k = d.data()?.notifications?.vapidKey || ''; setVapid(k); setSavedVapid(k) }).catch(() => {}) }, [])
  useEffect(() => onSnapshot(collection(db, TOKENS), (s) => setDevices(s.docs.map((d) => ({ id: d.id, ...d.data() }))), () => {}), [])

  const enable = async () => {
    setBusy(true); setMsg('')
    try {
      const r = await enableOnThisDevice(savedVapid, admin?.username)
      setPerm(permission())
      setMsg(r.push ? '✓ Qalabkan wuu diyaar yahay — notifications ayaa yimaada xitaa marka browser-ka la xiro.' : '✓ Notifications + dhawaaq waa shidan yihiin inta admin-ku furan yahay. Si ay u yimaadaan marka la xiro, dhammaystir tallaabooyinka hoose.')
    } catch (e) { setMsg(e.message); setPerm(permission()) }
    setBusy(false)
  }
  const test = () => { ring(); showLocal({ title: '🔔 Test — Dream Market Admin', body: 'Notifications waa shaqaynayaan!', tag: 'test-' + Date.now() }) }
  const saveKey = async () => {
    try { await setDoc(doc(db, COL.settings, 'site'), { notifications: { vapidKey: vapid.trim() } }, { merge: true }); setSavedVapid(vapid.trim()); setMsg('✓ Key-ga waa la kaydiyay. Hadda riix "Shid notifications" mar kale.') }
    catch (e) { setMsg(e.message) }
  }
  const device = (ua = '') => /iPhone|iPad/.test(ua) ? '📱 iPhone / iPad' : /Android/.test(ua) ? '📱 Android' : /Mac/.test(ua) ? '💻 Mac' : /Windows/.test(ua) ? '💻 Windows' : '🖥 Device'
  const [ic, label] = PERM[perm] || PERM.default

  return (
    <div className="nt">
      <div className="adm-pagehead"><div><h2>🔔 Notifications</h2><p>Ogeysiis + dhawaaq marka qof isku diiwaangeliyo tartan, fariin soo diro, ama newsletter-ka ku biiro.</p></div></div>

      <div className="adm-card nt-status">
        <div><small>Qalabkan (device-kan)</small><b>{ic} {label}</b>{mine && <em>📡 Push: diiwaangashan</em>}</div>
        <div className="nt-actions">
          <button className="btn btn--gold btn--lg" onClick={enable} disabled={busy || !supported()}>{busy ? '…' : '🔔 Shid notifications qalabkan'}</button>
          <button className="btn btn--ghost" onClick={test} disabled={perm !== 'granted'}>▶ Tijaabi</button>
        </div>
        <label className="adm-check"><input type="checkbox" checked={sound} onChange={(e) => { setSound(e.target.checked); setSoundOn(e.target.checked) }} /><span>🔊 Dhawaaq (qaylo) marka wax cusub yimaadaan</span></label>
        {msg && <p className={msg.startsWith('✓') ? 'ok' : 'err'}>{msg}</p>}
        <p className="muted nt-note">Samee qalab kasta oo aad rabto: laptop, tablet iyo mobile — gal /admin, login, kadib riix badhanka sare oo dooro <b>Allow</b>.</p>
      </div>

      <div className="adm-card">
        <h3>📡 Qalabka diiwaangashan ({devices.length})</h3>
        {devices.length === 0 && <p className="muted">Weli ma jiro. (Wuxuu soo baxayaa marka Web Push key la geliyo oo qalab la shido.)</p>}
        {devices.map((d) => (
          <div key={d.id} className="adm-item nt-dev">
            <div className="adm-item__info"><b>{device(d.ua)} {d.id === mine && <em className="nt-this">qalabkan</em>}</b><small>{d.username} · {d.createdAt?.toDate?.().toLocaleString() || ''}</small></div>
            <div className="adm-item__btns"><button className="danger" onClick={() => removeToken(d.id)}>✕</button></div>
          </div>
        ))}
      </div>

      <div className="adm-card nt-setup">
        <h3>⚙️ Hal mar: si notifications u yimaadaan xitaa marka browser-ka la xiro</h3>
        <ol>
          <li><b>Web Push key:</b> Firebase Console → ⚙ Project settings → <b>Cloud Messaging</b> → <b>Web Push certificates</b> → <b>Generate key pair</b> → koobi key-ga, halkan ku dheji:
            <div className="nt-key"><input placeholder="BKx…  (Web Push public key)" value={vapid} onChange={(e) => setVapid(e.target.value)} /><button className="btn btn--gold btn--sm" onClick={saveKey} disabled={vapid.trim() === savedVapid}>💾 Kaydi</button></div>
          </li>
          <li><b>Cloud Function (server-ka dira ogeysiiska):</b> VS Code terminal-ka, folder-ka project-ka:
            <pre>npm install -g firebase-tools{'\n'}firebase login{'\n'}cd functions{'\n'}npm install{'\n'}cd ..{'\n'}firebase deploy --only functions</pre>
            <small className="muted">Project-ku waa inuu ahaadaa Blaze plan (waa sidaas). Haddii deploy-gu sheego "region", fur <code>functions/index.js</code> oo <code>REGION</code> u beddel goobta Firestore-kaaga.</small></li>
          <li><b>Qalab kasta:</b> fur /admin → login → 🔔 Notifications → <b>Shid notifications qalabkan</b> → Allow.</li>
          <li><b>iPhone / iPad:</b> Safari → Share ⬆ → <b>Add to Home Screen</b> → ka fur icon-ka DMP → kadib tallaabada 3.</li>
        </ol>
      </div>
    </div>
  )
}
