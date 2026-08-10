import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

// Namespaced per app so a teacher and a learner signed in on the same device
// (a shared school tablet) do not overwrite each other's session.
const TOKEN_KEY = 'ignite_parent_token';
const USER_KEY = 'ignite_parent_user';

let accessToken = null;

/** Restore a saved session on app start. Returns the stored user, or null. */
export async function loadSession() {
  try {
    const [token, raw] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
    ]);
    accessToken = token;
    return token && raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function storeSession(token, user) {
  accessToken = token;
  try {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [USER_KEY, JSON.stringify(user)],
    ]);
  } catch {
    // Session lasts only while the app is open.
  }
}

export async function clearSession() {
  accessToken = null;
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  } catch {
    // ignore
  }
}

/** Give up rather than leave the user watching a spinner forever. */
const REQUEST_TIMEOUT_MS = 15000;

/**
 * Error carrying a message already fit to show a user.
 * `fieldErrors` holds validation messages when the server sent a list.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Called when any request comes back 401, so the shell can drop a session the
 * server no longer honours instead of leaving the app on a screen that will
 * never load. Set once, at app start.
 */
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

/**
 * The server wraps success as { data, meta } and failure as
 * { statusCode, error, message } where `message` is a string OR an array of
 * validation messages. Flatten both into a plain value / ApiError.
 */
export async function request(method, path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: controller.signal,
    });
  } catch (err) {
    throw new ApiError(
      err.name === 'AbortError'
        ? 'The server took too long to respond. Try again.'
        : `Cannot reach the IGNITE server at ${API_BASE_URL}. Check that it is running and that you are on the same network.`,
    );
  } finally {
    clearTimeout(timer);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // Non-JSON body (proxy error page, empty 204, and so on) is handled below.
  }

  if (!response.ok) {
    // 401 while holding a token means the token expired or was revoked. Signing
    // out here is what makes the app recover on its own.
    if (response.status === 401 && accessToken && onUnauthorized) onUnauthorized();

    const raw = payload?.message;
    const fieldErrors = Array.isArray(raw) ? raw : [];
    const message =
      (fieldErrors.length ? fieldErrors[0] : typeof raw === 'string' ? raw : null) ??
      `Something went wrong (${response.status}).`;
    throw new ApiError(message, { status: response.status, fieldErrors });
  }

  // `data: null` is a real answer — "no current lesson session", "no active
  // child" — so it must not fall through to the raw envelope. `?? payload`
  // did exactly that, handing callers `{ data: null, meta }`, which is truthy
  // and made every "nothing here" read as "something here".
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }
  return payload ?? {};
}

export const get = (path) => request('GET', path);
export const post = (path, body) => request('POST', path, body);
export const patch = (path, body) => request('PATCH', path, body);
export const put = (path, body) => request('PUT', path, body);
export const del = (path) => request('DELETE', path);

/** Build a query string, dropping empty values so no `?a=undefined` is sent. */
export function qs(params) {
  if (!params) return '';
  const pairs = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );
  if (!pairs.length) return '';
  return `?${pairs.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')}`;
}

/**
 * Paginated endpoints answer `{ data: { data: [...], total, page, limit } }`,
 * and `request` has already peeled the outer envelope. Unpaginated ones answer
 * a bare array. Both arrive here; callers just want the array.
 */
export function listOf(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}
