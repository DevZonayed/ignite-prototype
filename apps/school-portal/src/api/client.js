// Thin fetch wrapper for the IGNITE API.
//
// The server wraps success as { data, meta } and failure as
// { statusCode, error, message } where `message` is a string OR an array of
// validation messages. Everything below flattens that into plain data / ApiError.

const DEFAULT_BASE = 'http://localhost:4000/api'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE

const TOKEN_KEY = 'ignite_school_token'
const USER_KEY = 'ignite_school_user'

const REQUEST_TIMEOUT_MS = 15000

export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = [] } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

/* ---------------------------------------------------------------- session */

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null }
}

export function storeSession(token, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch { /* private mode: session lasts this tab only */ }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch { /* ignore */ }
}

// Anything that receives a 401 tells the app to drop back to sign-in.
const unauthorizedHandlers = new Set()
export function onUnauthorized(fn) {
  unauthorizedHandlers.add(fn)
  return () => unauthorizedHandlers.delete(fn)
}

/* ---------------------------------------------------------------- request */

async function request(method, path, body) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  const headers = { Accept: 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let init = { method, headers, signal: controller.signal }
  if (body instanceof FormData) {
    init.body = body // let the browser set the multipart boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init)
  } catch (err) {
    throw new ApiError(
      err.name === 'AbortError'
        ? 'The server took too long to respond.'
        : `Cannot reach the IGNITE API at ${API_BASE_URL}. Is the server running?`,
    )
  } finally {
    clearTimeout(timer)
  }

  let payload = null
  try { payload = await response.json() } catch { /* empty or non-JSON body */ }

  if (response.status === 401) {
    clearSession()
    unauthorizedHandlers.forEach((fn) => fn())
  }

  if (!response.ok) {
    const raw = payload?.message
    const fieldErrors = Array.isArray(raw) ? raw : []
    const message =
      (fieldErrors.length ? fieldErrors[0] : typeof raw === 'string' ? raw : null) ??
      `Request failed (${response.status}).`
    throw new ApiError(message, { status: response.status, fieldErrors })
  }

  return payload?.data ?? payload ?? null
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path),
}

/** Build a querystring, dropping empty values. */
export function qs(params) {
  const search = new URLSearchParams()
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') search.set(k, v)
  })
  const s = search.toString()
  return s ? `?${s}` : ''
}
