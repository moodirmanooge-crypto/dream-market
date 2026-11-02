// Turns the admin's saved photo position { x, y, zoom } into inline img styles
export function photoStyle(fit) {
  if (!fit) return undefined
  const x = fit.x ?? 50, y = fit.y ?? 50, z = fit.zoom ?? 1
  return { objectPosition: `${x}% ${y}%`, transformOrigin: `${x}% ${y}%`, transform: `scale(${z})` }
}
