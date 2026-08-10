/** Shared display helpers. Everything here tolerates null/undefined. */

export function fmtNumber(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '-'
  return Number(n).toLocaleString()
}

export function fmtDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function fmtDateTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString(undefined, {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

/** "3 min ago" / "Yesterday" / a date once it's more than a week old. */
export function fmtRelative(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  const secs = Math.round((Date.now() - d.getTime()) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.round(secs / 60)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.round(hrs / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return fmtDate(value)
}

export function fullName(user) {
  if (!user) return '-'
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return name || user.email || '-'
}

/** snake_case role/status -> "Title case" for display. */
export function humanize(value) {
  if (!value) return '-'
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function statusBadge(status) {
  switch (status) {
    case 'active': return 'b-green'
    case 'suspended': return 'b-amber'
    case 'invited': return 'b-blue'
    default: return 'b-grey'
  }
}

export function roleBadge(role) {
  return role && role.includes('admin') ? 'b-blue' : role === 'principal' ? 'b-blue' : 'b-grey'
}

/** Green at/above 85, amber 70-84, red below. */
export function coverageColor(percent) {
  const p = Number(percent) || 0
  if (p >= 85) return 'var(--success)'
  if (p >= 70) return 'var(--warning)'
  return 'var(--danger)'
}
