// Shared helpers for competitions (dates are entered in Somalia time, UTC+3)
export const parseDate = (s) => {
  if (!s) return null
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : `${s.length === 16 ? s + ':00' : s}+03:00`)
  return isNaN(d) ? null : d
}
export const fmtDate = (s, withTime = false) => {
  const d = parseDate(s)
  if (!d) return '—'
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}), timeZone: 'Africa/Mogadishu' })
}

export function compState(c, now = Date.now()) {
  const start = parseDate(c.start)?.getTime() ?? Infinity
  const end = parseDate(c.end)?.getTime() ?? Infinity
  const deadline = parseDate(c.regDeadline)?.getTime() ?? start
  const max = Number(c.maxParticipants) || 0
  const reg = Number(c.registered) || 0
  const full = max > 0 && reg >= max
  const phase = now >= end ? 'ended' : now >= start ? 'live' : 'upcoming'
  const isReal = c.id && c.id !== 'sample'
  const canRegister = isReal && !!c.registrationOpen && now < deadline && now < end && !full
  let label = phase === 'ended' ? 'Completed' : phase === 'live' ? 'Live Now' : 'Upcoming'
  let regLabel = canRegister ? 'Registration Open' : full ? 'Competition Full' : phase === 'ended' ? 'Completed' : now >= deadline ? 'Registration Closed' : 'Registration Opens Soon'
  // what the countdown points to
  const target = phase === 'upcoming' ? (canRegister && deadline < start ? { at: deadline, text: 'Registration closes in' } : { at: start, text: 'Starts in' })
    : phase === 'live' ? { at: end, text: 'Ends in' } : null
  return { phase, label, canRegister, regLabel, full, max, reg, target }
}

const MEDALS = ['🥇', '🥈', '🥉']
// Top-3 prizes for cards / panels (falls back to the prize pool)
export const topPrizes = (c) => (c.prizes || []).slice(0, 3).map((p, i) => ({ medal: MEDALS[i], place: p.place, prize: p.prize }))

export const lines = (t = '') => String(t).split('\n').map((x) => x.trim()).filter(Boolean)

// Leaderboard math: rank by profit %
export function rankBoard(rows = []) {
  return rows.map((r) => {
    const s = Number(r.startBalance) || 0, c = Number(r.currentBalance) || 0
    return { ...r, profit: c - s, pct: s ? ((c - s) / s) * 100 : 0 }
  }).sort((a, b) => (b.disqualified ? -1 : 0) - (a.disqualified ? -1 : 0) || b.pct - a.pct || b.profit - a.profit)
}
export const money = (n) => (n < 0 ? '-' : '') + '$' + Math.abs(Number(n) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
export const pctFmt = (n) => (n > 0 ? '+' : '') + (Number(n) || 0).toFixed(2) + '%'
