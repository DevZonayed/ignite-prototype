import { get, post, qs, listOf } from './client';

/**
 * Every server call the parent app makes.
 *
 * The child-scoped routes live at the API root (`/parents/...`, `/children/...`)
 * rather than under a module prefix, and the whole controller is @Roles('parent').
 */

/* ── children ─────────────────────────────────────────────────────────── */

/** The children linked to the signed-in parent. */
export const listChildren = () => get('/parents/me/children').then(listOf);

/** `{ daysPresent, activeProjects, newReports }` */
export const getWeeklySummary = (childId) => get(`/children/${childId}/weekly-summary`);

/** `{ termPercent, weeklyBreakdown: [{ week, percent }] }` */
export const getAttendance = (childId) => get(`/children/${childId}/attendance`);

/** `[{ id, title, type, date }]` */
export const getChildPortfolio = (childId) => get(`/children/${childId}/portfolio`).then(listOf);

/**
 * Skill levels, clamped to the rubric's 1..4.
 *
 * This read the wrong scale when LQS scores were stored as percentages instead
 * of 1-4 ratings, which pinned every dimension to the top level. The seed no
 * longer does that, but the guard stays: a score written on the wrong scale
 * should not silently report a child as excelling in everything.
 */
export const getChildSkills = (childId) =>
  get(`/children/${childId}/skills`).then((r) => ({
    ...r,
    dimensions: (r?.dimensions ?? []).map((d) => {
      const raw = Number(d.level) || 0;
      const level = raw > 4 ? (raw / 100) * 4 : raw;
      return { ...d, level: Math.max(0, Math.min(4, level)) };
    }),
  }));

/** `[{ type, title, date, actionRequired }]` — the child's activity feed. */
export const getChildFeed = (childId) => get(`/children/${childId}/feed`).then(listOf);

/* ── homework ─────────────────────────────────────────────────────────── */

export const listHomework = (childId) => get(`/homework${qs({ childId })}`).then(listOf);
export const listSubmissions = (homeworkId) =>
  get(`/homework/${homeworkId}/submissions`).then(listOf);
/** A parent uploads on their child's behalf. */
export const createSubmission = (homeworkId, body) =>
  post(`/homework/${homeworkId}/submissions`, body);
export const listSubmissionMessages = (submissionId) =>
  get(`/homework/submissions/${submissionId}/messages`).then(listOf);
export const sendSubmissionMessage = (submissionId, body, senderName) =>
  post(`/homework/submissions/${submissionId}/messages`, {
    senderType: 'parent',
    ...(senderName ? { senderName } : {}),
    body,
  });

/* ── reports ──────────────────────────────────────────────────────────── */

export const listProgressReports = (childId) =>
  get(`/reports/progress${qs({ childId })}`).then(listOf);
export const getProgressReport = (id) => get(`/reports/progress/${id}`);
