// Social media icons — links come from Admin → Contact & Social. Empty links are hidden.
const I = {
  tiktok: <path d="M16.6 3c.4 2.2 1.8 3.7 4 3.9v3.2c-1.5.1-2.8-.4-4-1.1v6.2c0 3.6-2.7 5.8-5.8 5.8A5.6 5.6 0 0 1 5.2 15c0-3.3 2.9-5.9 6.5-5.4v3.3c-1.6-.4-3.2.6-3.2 2.1 0 1.3 1 2.3 2.3 2.3 1.4 0 2.4-1 2.4-2.6V3h3.4z" />,
  youtube: <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" />,
  facebook: <path d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8.1v3h2.5V21h2.9z" />,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.3" cy="6.7" r="1.2" /></>,
  x: <path d="M17.8 3h3l-6.6 7.6L22 21h-6.1l-4.8-6.2L5.6 21h-3l7.1-8.1L2.2 3h6.2l4.3 5.7L17.8 3zm-1 16.2h1.7L7.3 4.7H5.5l11.3 14.5z" />,
  linkedin: <path d="M4.5 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3 9h3v12H3V9zm5 0h2.9v1.7c.4-.8 1.4-1.9 3.3-1.9 3.2 0 3.8 2.1 3.8 4.8V21h-3v-6.6c0-1.6 0-3.5-2.2-3.5s-2.5 1.7-2.5 3.4V21H8V9z" />,
  spotify: <><circle cx="12" cy="12" r="10" /><path d="M7 9.5c3.5-1 7.5-.7 10.5 1M7.5 12.7c3-.8 6-.5 8.6.9M8 15.7c2.4-.6 4.6-.4 6.7.7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" fill="none" /></>,
  apple: <><circle cx="12" cy="9.5" r="2.6" /><path d="M10.6 13.4h2.8l-.5 7h-1.8l-.5-7z" /><path d="M6.8 15.5a7 7 0 1 1 10.4 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
  telegram: <path d="M21.5 4.2 2.9 11.4c-1.2.5-1.2 1.2 0 1.6l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.8-1.5-1.2zM8.9 14.2l9.4-5.9c.5-.3.9-.1.5.2l-7.9 7.2-.3 3.3-1.7-4.8z" />,
  whatsapp: <path d="M12 2.2A9.8 9.8 0 0 0 3.6 17l-1.4 5 5.1-1.3A9.8 9.8 0 1 0 12 2.2zm0 17.9c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.1 8.1 0 1 1 12 20.1zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.8c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />,
}
export const SOCIAL_NAMES = { tiktok: 'TikTok', youtube: 'YouTube', facebook: 'Facebook', instagram: 'Instagram', x: 'X', linkedin: 'LinkedIn', spotify: 'Spotify', apple: 'Apple Podcasts', telegram: 'Telegram', whatsapp: 'WhatsApp' }

export function SocialIcon({ name, size = 20 }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>{I[name]}</svg>
}

export default function SocialLinks({ social = {}, variant = 'icons', label }) {
  const list = Object.keys(SOCIAL_NAMES).filter((k) => social[k])
  if (!list.length) return null
  return (
    <div className={`social social--${variant}`}>
      {label && <span className="social__label">{label}</span>}
      {list.map((k) => (
        <a key={k} href={social[k]} target="_blank" rel="noreferrer" className={`social__a social__a--${k}`} aria-label={SOCIAL_NAMES[k]} title={SOCIAL_NAMES[k]}>
          <SocialIcon name={k} />
          {variant === 'pills' && <span>{SOCIAL_NAMES[k]}</span>}
        </a>
      ))}
    </div>
  )
}
