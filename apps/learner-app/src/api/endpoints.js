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
 * Radar points, clamped to the 0..1 the chart draws on.
 *
 * The server's own maths is right (average rating ÷ 4); what broke it was LQS
 * scores stored as percentages instead of the rubric's 1-4, which pushed
 * spokes far outside the chart. The seed no longer does that, but any score
 * written on the wrong scale would do it again, so the guard stays — a wrong
 * number should read as "full marks", not draw off the canvas.
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
