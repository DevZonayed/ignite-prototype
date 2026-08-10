/**
 * Presentation helpers for a portfolio project as the server returns it:
 * `{ id, title, fileType, fileName, codeSnippet, description, skills, ... }`.
 *
 * The old mock data carried its own colours and a pre-formatted "scratch ·
 * maze.sb3" string. The server carries neither, so both are derived from
 * `fileType` here rather than in each screen.
 */

const BY_TYPE = {
  scratch: { gradient: ['#3B82F6', '#2563EB'], badge: '.sb3', kind: 'code' },
  python: { gradient: ['#22C55E', '#16A34A'], badge: '.py', kind: 'python' },
  robotics: { gradient: ['#F43F5E', '#E11D48'], badge: 'robot', kind: 'robot' },
  design: { gradient: ['#A78BFA', '#7C3AED'], badge: 'img', kind: 'design' },
  video: { gradient: ['#2DD4BF', '#14B8A6'], badge: 'mp4', kind: 'video' },
};

const FALLBACK = { gradient: ['#64748B', '#475569'], badge: '◎', kind: 'code' };

export function styleFor(project) {
  return BY_TYPE[project?.fileType] ?? FALLBACK;
}

/** "scratch · maze.sb3", or just the type when the server has no file name. */
export function subtitleFor(project) {
  if (!project) return '';
  return [project.fileType, project.fileName].filter(Boolean).join(' · ');
}

/** Short glyph for a list thumbnail. */
export function tagFor(project) {
  return styleFor(project).badge;
}

/** Flattens the `{ groups: { scratch: [...] } }` portfolio into one list. */
export function flattenGroups(portfolio) {
  const groups = portfolio?.groups ?? {};
  return Object.values(groups).flat().filter(Boolean);
}
