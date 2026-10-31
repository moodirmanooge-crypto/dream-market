import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { COL, defaultSettings } from '../data/seed'
import { mergeDeep } from '../hooks/useSettings'
import { ValueEditor } from './fields'

// Edits one or more top-level keys of dreamSettings/site
export default function SettingsEditor({ keys, title, help }) {
  const [data, setData] = useState(null)
  const [state, setState] = useState('')

  useEffect(() => {
    getDoc(doc(db, COL.settings, 'site')).then((d) => setData(mergeDeep(defaultSettings, d.data() || {}))).catch((e) => setState(e.message))
  }, [])

  const save = async () => {
    setState('saving')
    try {
      const patch = Object.fromEntries(keys.map((k) => [k, data[k]]))
      await setDoc(doc(db, COL.settings, 'site'), { ...patch, updatedAt: serverTimestamp() }, { merge: true })
      setState('saved'); setTimeout(() => setState(''), 2500)
    } catch (e) { setState(e.message) }
  }

  if (!data) return <div className="adm-card">Loading… {state && <p className="err">{state}</p>}</div>
  return (
    <div className="adm-settings">
      <div className="adm-pagehead">
        <div><h2>{title}</h2>{help && <p>{help}</p>}</div>
        <button className="btn btn--gold" onClick={save} disabled={state === 'saving'}>{state === 'saving' ? 'Kaydinaya…' : '💾 Kaydi'}</button>
      </div>
      {state && !['saving', 'saved'].includes(state) && <p className="err">{state}</p>}
      {keys.map((k) => (
        <div className="adm-card" key={k}>
          <ValueEditor k={k} value={data[k]} template={defaultSettings[k]} folder={k} onChange={(v) => setData({ ...data, [k]: v })} />
        </div>
      ))}
      <div className="adm-savebar">
        {state === 'saved' && <span className="ok">✓ Waa la kaydiyay — website-ka hadda ayuu isbeddelay</span>}
        <button className="btn btn--gold" onClick={save} disabled={state === 'saving'}>💾 Kaydi isbeddelka</button>
      </div>
    </div>
  )
}
