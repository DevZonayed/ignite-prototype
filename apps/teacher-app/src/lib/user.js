/** Display helpers for the user object the API returns. */

export function displayName(user) {
  if (!user) return '';
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name || user.email || '';
}

export function firstName(user) {
  if (!user) return '';
  return (user.firstName || displayName(user).split(' ')[0] || '').trim();
}

/**
 * The server stores `initials` but they can be absent for an account created
 * outside the invite flow, so fall back to deriving them from the name.
 */
export function initialsOf(user) {
  if (!user) return '';
  if (user.initials) return user.initials;
  const parts = displayName(user).split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** "teacher" -> "Teacher", "curriculum_admin" -> "Curriculum admin" */
export function roleLabel(user) {
  if (!user?.role) return '';
  const r = String(user.role).replace(/_/g, ' ');
  return r.charAt(0).toUpperCase() + r.slice(1);
}
