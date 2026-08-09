import { get, qs, listOf } from './client';

/**
 * Every server call the learner app makes. A learner only ever reads their own
 * record, so each of these takes the signed-in learner's id.
 */

/* ── portfolio ────────────────────────────────────────────────────────── */

/** `{ learnerId, groups: { scratch: [...], python: [...], ... } }` */
export const getPortfolio = (learnerId) => get(`/portfolio/learner/${learnerId}`);
export const getRecentWork = (learnerId) =>
  get(`/portfolio/learner/${learnerId}/recent`).then(listOf);
/** `{ streak, termProgressPercent, totalBadges, latestBadge, overallLqs }` */
export const getProgress = (learnerId) => get(`/portfolio/learner/${learnerId}/progress`);
export const getProject = (projectId) => get(`/portfolio/projects/${projectId}`);

/* ── skills (LQS) ─────────────────────────────────────────────────────── */

/** `{ totalScore, dimensions: [{ name, color, averageScore, level, weight }] }` */
export const getLqs = (learnerId) => get(`/lqs/learner/${learnerId}`);

/**
 * Radar points, normalised to 0..1.
 *
 * The server mixes scales in this response — some dimensions come back as a
 * fraction (0.75) and others as a percentage-like number (22.5). Rather than
 * let the chart draw spokes off the canvas, anything above 1 is treated as a
 * percentage. Remove this once the server returns one scale.
 */
export const getRadar = (learnerId) =>
  get(`/lqs/learner/${learnerId}/radar`).then((r) => ({
    ...r,
    dimensions: (r?.dimensions ?? []).map((d) => ({
      ...d,
      value: Math.max(0, Math.min(1, Number(d.value) > 1 ? Number(d.value) / 100 : Number(d.value) || 0)),
    })),
  }));

/** `[{ badge: {...}, earned, awardedAt }]` — earned and unearned together. */
export const getBadges = (learnerId) =>
  get(`/lqs/badges/learner/${learnerId}`).then(listOf);

/* ── certificate ──────────────────────────────────────────────────────── */

export const getCertificate = (learnerId) => get(`/lqs/certificates/learner/${learnerId}`);

/* ── homework ─────────────────────────────────────────────────────────── */

export const listHomework = (params) => get(`/homework${qs(params)}`).then(listOf);
