export function ytId(url = '') {
  const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)
  return m ? m[1] : null
}

/*
  What an episode plays (chosen by the admin in Episodes → "Sida website-ka loogu muujiyo"):
   - 'video'      → the uploaded video WITH ITS OWN SOUND
   - 'videoAudio' → the uploaded video, but the sound comes from the uploaded voice/audio file
   - 'audio'      → voice only (audio file, or the sound of the video)
   - YouTube link as a fallback
*/
export function epMedia(e = {}) {
  const mode = e.mediaMode || (e.video && e.audio ? 'videoAudio' : e.audio && !e.video ? 'audio' : 'video')
  if (mode === 'audio' && (e.audio || e.video)) return { kind: 'audio', src: e.audio || e.video }
  if (mode === 'videoAudio' && e.video && e.audio) return { kind: 'video', src: e.video, audio: e.audio }
  if (e.video) return { kind: 'video', src: e.video }
  if (e.audio) return { kind: 'audio', src: e.audio }
  const id = ytId(e.youtube)
  if (id) return { kind: 'youtube', id }
  return null
}
