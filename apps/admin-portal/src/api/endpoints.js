import { api, qs } from './client.js'

/* auth */
export const getBootstrapStatus = () => api.get('/auth/bootstrap-status')
export const bootstrapAdmin = (body) => api.post('/auth/bootstrap', body)
export const signIn = (identifier, password, role = 'platform_admin') =>
  api.post('/auth/signin', { identifier, password, role })
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

/* monitoring */
export const getPlatformDashboard = () => api.get('/monitoring/dashboard')
export const getMonitoringStats = () => api.get('/monitoring/stats')
export const getLessonsDelivered = () => api.get('/monitoring/lessons-delivered')
export const getHealth = () => api.get('/monitoring/health')

/* schools */
export const listSchools = (params) => api.get(`/schools${qs(params)}`)
export const getSchoolDashboard = (id) => api.get(`/schools/${id}/dashboard`)
export const createSchool = (body) => api.post('/schools', body)
export const updateSchool = (id, body) => api.patch(`/schools/${id}`, body)
export const deleteSchool = (id) => api.del(`/schools/${id}`)

/* users */
export const listUsers = (params) => api.get(`/users${qs(params)}`)
export const inviteUser = (body) => api.post('/users/invite', body)
export const updateUser = (id, body) => api.patch(`/users/${id}`, body)
export const updateUserStatus = (id, status) => api.patch(`/users/${id}/status`, { status })
export const resetUserPassword = (id) => api.post(`/users/${id}/reset-password`)
export const deleteUser = (id) => api.del(`/users/${id}`)

/* curriculum */
export const listCurricula = () => api.get('/curriculum')
export const getCurriculum = (id) => api.get(`/curriculum/${id}`)
export const getCoverage = (schoolId) => api.get(`/curriculum/coverage${qs({ schoolId })}`)
export const createCurriculum = (name) => api.post('/curriculum', { name })
export const publishCurriculum = (id) => api.put(`/curriculum/${id}/publish`)
export const assignCurriculum = (id, schoolIds) => api.post(`/curriculum/${id}/assign`, { schoolIds })
export const addUnit = (id, body) => api.post(`/curriculum/${id}/units`, body)
export const updateUnit = (id, unitId, body) => api.patch(`/curriculum/${id}/units/${unitId}`, body)
export const deleteUnit = (id, unitId) => api.del(`/curriculum/${id}/units/${unitId}`)

/* media */
export const listMedia = (params) => api.get(`/media${qs(params)}`)
export const deleteMedia = (id) => api.del(`/media/${id}`)

/* announcements */
export const listAnnouncements = (params) => api.get(`/announcements${qs(params)}`)
export const createAnnouncement = (body) => api.post('/announcements', body)
export const deleteAnnouncement = (id) => api.del(`/announcements/${id}`)

/* scoring (LQS) */
export const getDimensions = () => api.get('/lqs/dimensions')
export const updateDimensions = (dimensions) => api.put('/lqs/dimensions', { dimensions })
export const getBadges = () => api.get('/lqs/badges')

/* AI */
export const getAiConfig = () => api.get('/ai/config')
export const updateAiConfig = (body) => api.put('/ai/config', body)
export const getAiUsage = () => api.get('/ai/usage')
export const getAiSchoolUsage = (params) => api.get(`/ai/usage/schools${qs(params)}`)

/* audit */
export const listAudit = (params) => api.get(`/audit${qs(params)}`)

/* imports */
export const getImportTemplate = () => api.get('/imports/template')
export const getImportJob = (id) => api.get(`/imports/${id}`)
