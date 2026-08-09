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

/** "teacher" -> "Teacher", "curriculum_admin" -> "Curriculum admin" */
export function roleLabel(user) {
  if (!user?.role) return '';
  const r = String(user.role).replace(/_/g, ' ');
  return r.charAt(0).toUpperCase() + r.slice(1);
}
