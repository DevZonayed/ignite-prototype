import { get, post, patch, put, del, qs, listOf } from './client';

/**
 * Every server call the teacher app makes, in one place, so no screen builds a
 * URL. Functions that fetch a collection return a plain array — `listOf`
 * absorbs the difference between endpoints that paginate (`{data, total, …}`)
 * and endpoints that answer a bare array.
 */

/* ── classes and learners ─────────────────────────────────────────────── */

export const listClasses = () => get(`/classes`).then(listOf);
export const getClass = (id) => get(`/classes/${id}`);
export const listLearners = (classId) => get(`/classes/${classId}/learners`).then(listOf);

/* ── curriculum and lessons ───────────────────────────────────────────── */

export const listCurricula = () => get('/curriculum').then(listOf);
/** A curriculum with its units, each carrying its lessons. */
export const getCurriculum = (id) => get(`/curriculum/${id}`);
export const listLessons = (params) => get(`/lessons${qs(params)}`).then(listOf);
export const getLesson = (id) => get(`/lessons/${id}`);
export const getLessonSteps = (id) => get(`/lessons/${id}/steps`).then(listOf);
export const getLessonMedia = (id) => get(`/lessons/${id}/media`).then(listOf);
/**
 * The lesson's activity checklist.
 *
 * The server has no boolean for "done": it toggles a literal `[x] ` prefix on
 * the activity title. Decoding that here means no screen has to know, and the
 * title they render is the clean one.
 */
const DONE_PREFIX = '[x] ';
export const getLessonActivities = (id) =>
  get(`/lessons/${id}/activities`)
    .then(listOf)
    .then((rows) =>
      rows.map((a) => ({
        ...a,
        completed: a.title.startsWith(DONE_PREFIX),
        title: a.title.startsWith(DONE_PREFIX) ? a.title.slice(DONE_PREFIX.length) : a.title,
      })),
    );
/** Flips one activity's completion. Takes no body — the call is the toggle. */
export const toggleLessonActivity = (lessonId, activityId) =>
  patch(`/lessons/${lessonId}/activities/${activityId}`);

/* ── live lesson sessions ─────────────────────────────────────────────── */

/** The session in progress for a class, or null when nothing is running. */
export const getCurrentSession = (classId) =>
  get(`/lesson-sessions/current${qs({ classId })}`);
export const startSession = (body) => post('/lesson-sessions', body);
export const updateSession = (id, body) => patch(`/lesson-sessions/${id}`, body);
export const completeSession = (id, body) => patch(`/lesson-sessions/${id}/complete`, body);
export const getSessionStats = (id) => get(`/lesson-sessions/${id}/stats`);

/* ── attendance ───────────────────────────────────────────────────────── */

export const listAttendance = (params) => get(`/attendance${qs(params)}`).then(listOf);
export const getSessionAttendance = (sessionId) =>
  get(`/attendance/session/${sessionId}`).then(listOf);
export const markAttendanceBulk = (lessonSessionId, records) =>
  post('/attendance/bulk', { lessonSessionId, records });
/** Replaces a session's attendance wholesale — what the mark-all screen saves. */
export const saveSessionAttendance = (sessionId, records) =>
  put(`/attendance/session/${sessionId}`, { records });
export const getClassWeeklyAttendance = (classId) =>
  get(`/attendance/class/${classId}/weekly`);

/* ── homework ─────────────────────────────────────────────────────────── */

export const listHomework = (params) => get(`/homework${qs(params)}`).then(listOf);
export const getHomework = (id) => get(`/homework/${id}`);
export const createHomework = (body) => post('/homework', body);
export const updateHomework = (id, body) => patch(`/homework/${id}`, body);
export const deleteHomework = (id) => del(`/homework/${id}`);
export const listSubmissions = (homeworkId, params) =>
  get(`/homework/${homeworkId}/submissions${qs(params)}`).then(listOf);
export const getSubmission = (submissionId) => get(`/homework/submissions/${submissionId}`);
/** Marks a submission reviewed. The server takes no body — the act is the data. */
export const publishFeedback = (submissionId) =>
  patch(`/homework/submissions/${submissionId}/feedback`);
export const listSubmissionMessages = (submissionId) =>
  get(`/homework/submissions/${submissionId}/messages`).then(listOf);

/**
 * Every submission across a class, which the review queue is organised around.
 *
 * The server only exposes submissions per homework, so this fans out over the
 * class's homework. That is one request per assignment — fine for a class's
 * worth, and the alternative is a screen that cannot show a queue at all.
 * Each submission carries its homework's title so rows can be labelled.
 */
export async function listClassSubmissions(classId, reviewStatus) {
  const homework = await listHomework({ classId });
  const perHomework = await Promise.all(
    homework.map((hw) =>
      listSubmissions(hw.id, { reviewStatus })
        .then((subs) => subs.map((s) => ({ ...s, homework: hw })))
        // One unreadable assignment should not blank the whole queue.
        .catch(() => []),
    ),
  );
  return perHomework.flat();
}
export const sendSubmissionMessage = (submissionId, body, senderName) =>
  post(`/homework/submissions/${submissionId}/messages`, {
    senderType: 'teacher',
    ...(senderName ? { senderName } : {}),
    body,
  });

/* ── evidence ─────────────────────────────────────────────────────────── */

export const listEvidence = (params) => get(`/evidence${qs(params)}`).then(listOf);
export const createEvidence = (body) => post('/evidence', body);
export const deleteEvidence = (id) => del(`/evidence/${id}`);
export const tagEvidence = (id, learnerIds) => post(`/evidence/${id}/tags`, { learnerIds });

/* ── assessment ───────────────────────────────────────────────────────── */

// Plural: the controller is @Controller('assessments').
export const listAssessments = (params) => get(`/assessments${qs(params)}`).then(listOf);
export const saveAssessmentsBulk = (body) => post('/assessments/bulk', body);
export const getLearnerAssessments = (learnerId) =>
  get(`/assessments/learner/${learnerId}`).then(listOf);

/* ── LQS (rubric scoring and badges) ──────────────────────────────────── */

export const listDimensions = () => get('/lqs/dimensions').then(listOf);
export const listScores = (params) => get(`/lqs/scores${qs(params)}`).then(listOf);
export const saveScoresBulk = (body) => post('/lqs/scores/bulk', body);
export const getLearnerLqs = (learnerId) => get(`/lqs/learner/${learnerId}`);
export const getLearnerRadar = (learnerId) => get(`/lqs/learner/${learnerId}/radar`);
export const listBadges = () => get('/lqs/badges').then(listOf);
export const listLearnerBadges = (learnerId) =>
  get(`/lqs/badges/learner/${learnerId}`).then(listOf);
export const awardBadge = (body) => post('/lqs/badges/award', body);

/* ── portfolio ────────────────────────────────────────────────────────── */

export const listProjects = (params) => get(`/portfolio${qs(params)}`).then(listOf);
export const listLearnerProjects = (learnerId) =>
  get(`/portfolio/learner/${learnerId}`).then(listOf);
export const createProject = (body) => post('/portfolio/projects', body);

/* ── notifications ────────────────────────────────────────────────────── */

export const listNotifications = (params) => get(`/notifications${qs(params)}`).then(listOf);
export const markNotificationRead = (id) => patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => patch('/notifications/read-all');

/* ── offline sync queue ───────────────────────────────────────────────── */

export const getSyncQueue = () => get('/sync/queue').then(listOf);
export const triggerSync = () => post('/sync/trigger');
export const removeSyncItem = (id) => del(`/sync/queue/${id}`);

/* ── AI assistant ─────────────────────────────────────────────────────── */

/** Prior turns for the signed-in teacher, newest page first. */
export const listAiMessages = (params) => get(`/ai/conversations${qs(params)}`).then(listOf);
/** Sends one turn and resolves with the assistant's reply. */
export const sendAiMessage = (content, lessonId) =>
  post('/ai/conversations', { content, ...(lessonId ? { lessonId } : {}) });

/* ── announcements ────────────────────────────────────────────────────── */

export const listAnnouncements = (params) => get(`/announcements${qs(params)}`).then(listOf);
