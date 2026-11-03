export function ytId(url = '') {
  const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)
  return m ? m[1] : null
}

// What an episode plays: audio (voice), uploaded video, or YouTube.
// mediaMode 'audio' turns an uploaded VIDEO into voice-only on the website.
export function epMedia(e = {}) {
  const mode = e.mediaMode || (e.audio && !e.video ? 'audio' : 'video')
  if (mode === 'audio' && (e.audio || e.video)) return { kind: 'audio', src: e.audio || e.video }
  if (e.video) return { kind: 'video', src: e.video }
  if (e.audio) return { kind: 'audio', src: e.audio }
  const id = ytId(e.youtube)
  if (id) return { kind: 'youtube', id }
  return null
}
