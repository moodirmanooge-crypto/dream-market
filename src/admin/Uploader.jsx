import { useRef, useState } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'

// Upload an image / video to Firebase Storage, or paste a link
export default function Uploader({ value, onChange, kind = 'image', folder = 'media' }) {
  const input = useRef(null)
  const [pct, setPct] = useState(null)
  const [err, setErr] = useState('')

  const upload = (file) => {
    if (!file) return
    setErr('')
    const name = file.name.replace(/[^\w.-]+/g, '_')
    const task = uploadBytesResumable(ref(storage, `dream/${folder}/${Date.now()}-${name}`), file, { contentType: file.type })
    task.on('state_changed',
      (s) => setPct(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      (e) => { setPct(null); setErr(e.code === 'storage/unauthorized' ? 'Storage rules ma ogola — eeg README (storage.rules).' : e.message) },
      async () => { onChange(await getDownloadURL(task.snapshot.ref)); setPct(null) })
  }

  const isAudio = kind === 'audio' || /\.(mp3|m4a|wav|ogg|aac)(\?|$)/i.test(value || '')
  const isVideo = !isAudio && (kind === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(value || ''))
  const isPdf = /\.pdf(\?|$)/i.test(value || '') || /%2F[^?]*\.pdf/i.test(value || '')
  return (
    <div className="upl">
      <div className={`upl__preview ${value ? '' : 'is-empty'}`} onClick={() => input.current.click()}
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files[0]) }}>
        {value ? (isAudio ? <audio src={value} controls onClick={(e) => e.stopPropagation()} /> : isPdf ? <a href={value} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="upl__pdf">📄 PDF — fur</a> : isVideo ? <video src={value} muted controls /> : <img src={value} alt="" />)
          : <span>{kind === 'video' ? '🎬' : kind === 'audio' ? '🎧' : '🖼️'}<small>Riix ama soo jiid {kind === 'video' ? 'video' : kind === 'audio' ? 'cod (voice) ama video' : kind === 'file' ? 'sawir ama PDF' : 'sawir'}</small></span>}
        {pct !== null && <div className="upl__bar"><i style={{ width: `${pct}%` }} /><b>{pct}%</b></div>}
      </div>
      <div className="upl__row">
        <input type="url" placeholder="…ama ku dheji link" value={value || ''} onChange={(e) => onChange(e.target.value)} />
        <button type="button" onClick={() => input.current.click()}>Upload</button>
        {value && <button type="button" className="danger" onClick={() => onChange('')}>✕</button>}
      </div>
      {err && <small className="err">{err}</small>}
      <input ref={input} type="file" hidden accept={kind === 'audio' ? 'audio/*,video/*' : kind === 'video' ? 'video/*' : kind === 'file' ? 'image/*,application/pdf' : 'image/*'} onChange={(e) => { upload(e.target.files[0]); e.target.value = '' }} />
    </div>
  )
}
