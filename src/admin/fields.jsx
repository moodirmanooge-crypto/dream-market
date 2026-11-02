import Uploader from './Uploader'

export const human = (k) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())

export function inferType(key, value) {
  const k = key.toLowerCase()
  if (k.includes('video')) return 'video'
  if (k.includes('certificate')) return 'file'
  if (k.includes('image') || k.includes('logo') && k !== 'logotext' || k === 'photo') return 'image'
  if (typeof value === 'boolean') return 'checkbox'
  if (typeof value === 'number') return 'number'
  if (k === 'text' || k === 'description' || (typeof value === 'string' && value.length > 70)) return 'textarea'
  if (k.includes('link') || k.includes('url') || ['youtube', 'spotify', 'apple', 'instagram', 'tiktok', 'linkedin', 'x', 'facebook', 'telegram', 'whatsapp'].includes(k)) return 'url'
  return 'text'
}

// One input of any type
export function Field({ label, type, value, onChange, folder, hint, options = [], rows = 3 }) {
  let input
  if (type === 'image' || type === 'video' || type === 'file') input = <Uploader kind={type} value={value} onChange={onChange} folder={folder} />
  else if (type === 'select') input = <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}</select>
  else if (type === 'datetime') input = <input type="datetime-local" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  else if (type === 'textarea') input = <textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  else if (type === 'checkbox') return (
    <label className="adm-check"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /><span>{label}</span></label>
  )
  else input = <input type={type === 'number' ? 'number' : type === 'url' ? 'url' : 'text'} value={value ?? ''}
    onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)} />
  return <label className="adm-field"><span>{label}{hint && <em>{hint}</em>}</span>{input}</label>
}

const move = (arr, i, d) => { const a = [...arr]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a }

// Recursive editor for any settings value (object, list, list of objects, string…)
export function ValueEditor({ k, value, template, onChange, folder }) {
  if (Array.isArray(value)) {
    const tpl = template?.[0] ?? value[0] ?? ''
    const objects = typeof tpl === 'object'
    return (
      <div className="adm-list">
        <div className="adm-list__head">{human(k)} <small>({value.length})</small></div>
        {value.map((item, i) => (
          <div key={i} className={`adm-list__item ${objects ? 'is-obj' : ''}`}>
            <div className="adm-list__body">
              {objects
                ? Object.keys({ ...tpl, ...item }).map((sk) => (
                  <Field key={sk} label={human(sk)} type={inferType(sk, tpl[sk] ?? item[sk])} value={item[sk]} folder={folder}
                    onChange={(v) => onChange(value.map((x, j) => (j === i ? { ...x, [sk]: v } : x)))} />))
                : <input value={item} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />}
            </div>
            <div className="adm-list__btns">
              <button type="button" title="Kor u qaad" onClick={() => onChange(move(value, i, -1))}>↑</button>
              <button type="button" title="Hoos u dhig" onClick={() => onChange(move(value, i, 1))}>↓</button>
              <button type="button" className="danger" title="Tirtir" onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
            </div>
          </div>
        ))}
        <button type="button" className="adm-add" onClick={() => onChange([...value, objects ? Object.fromEntries(Object.keys(tpl).map((x) => [x, typeof tpl[x] === 'number' ? 0 : ''])) : ''])}>+ Ku dar</button>
      </div>
    )
  }
  if (value && typeof value === 'object') {
    return (
      <fieldset className="adm-group">
        <legend>{human(k)}</legend>
        {Object.keys({ ...(template || {}), ...value }).map((sk) => (
          <ValueEditor key={sk} k={sk} value={value[sk] ?? template?.[sk]} template={template?.[sk]} folder={folder}
            onChange={(v) => onChange({ ...value, [sk]: v })} />
        ))}
      </fieldset>
    )
  }
  return <Field label={human(k)} type={inferType(k, template ?? value)} value={value} onChange={onChange} folder={folder} />
}
