import { api, qs } from './client.js'

/* auth */
export const signIn = (identifier, password) =>
  api.post('/auth/signin', { identifier, password, role: 'principal' })
export const activateAccount = (identifier, inviteCode, password) =>
  api.post('/auth/activate', {
    identifier: identifier.trim(),
    inviteCode: inviteCode.trim().toUpperCase(),
    password,
    acceptTerms: true,
    // Portals serve every role and tell people where to go afterwards, so they
    // opt out of the audience check explicitly rather than by omission.
    role: 'any',
  })
export const getMe = () => api.get('/auth/me')
export const updateMe = (body) => api.patch('/auth/me', body)
export const changePassword = (body) => api.post('/auth/me/password', body)

/* the principal's own school */
export const getSchool = (id) => api.get(`/schools/${id}`)
export const getSchoolDashboard = (id) => api.get(`/schools/${id}/dashboard`)
export const getSchoolSettings = (id) => api.get(`/schools/${id}/settings`)

/* people */
export const listUsers = (params) => api.get(`/users${qs(params)}`)
export const inviteUser = (body) => api.post('/users/invite', body)
export const deleteUser = (id) => api.del(`/users/${id}`)

/* classes */
export const listClasses = (params) => api.get(`/classes${qs(params)}`)
export const getClass = (id) => api.get(`/classes/${id}`)
export const getClassLearners = (id) => api.get(`/classes/${id}/learners`)
export const createClass = (body) => api.post('/classes', body)
export const updateClass = (id, body) => api.patch(`/classes/${id}`, body)

/* curriculum (read-only for a principal) */
export const listCurricula = () => api.get('/curriculum')
export const getCoverage = (schoolId) => api.get(`/curriculum/coverage${qs({ schoolId })}`)

/* homework */
export const listHomework = (params) => api.get(`/homework${qs(params)}`)
export const getHomeworkCompliance = (schoolId) =>
  api.get(`/homework/compliance${qs({ schoolId })}`)
export const sendHomeworkReminders = (body) => api.post('/homework/reminders', body)

/* attendance and assessment */
export const getAttendanceTrend = (schoolId, weeks = 6) =>
  api.get(`/attendance/trend${qs({ schoolId, weeks })}`)
export const getAttendanceHeatmap = (schoolId) =>
  api.get(`/attendance/heatmap${qs({ schoolId })}`)
export const getAssessmentDistribution = (schoolId) =>
  api.get(`/assessments/distribution${qs({ schoolId })}`)

/* reports */
export const listSchoolReports = (params) => api.get(`/reports/school${qs(params)}`)
export const createSchoolReport = (body) => api.post('/reports/school', body)
export const schoolReportDownloadUrl = (id) => `/reports/school/${id}/download`
export const listProgressReports = (params) => api.get(`/reports/progress${qs(params)}`)

/* monitoring */
export const getMonitoringStats = () => api.get('/monitoring/stats')
export const getLessonsDelivered = () => api.get('/monitoring/lessons-delivered')

/* announcements the school can see */
export const listAnnouncements = (params) => api.get(`/announcements${qs(params)}`)
