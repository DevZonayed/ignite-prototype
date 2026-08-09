import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

// Namespaced per app so a teacher and a learner signed in on the same device
// (a shared school tablet) do not overwrite each other's session.
const TOKEN_KEY = 'ignite_learner_token';
const USER_KEY = 'ignite_learner_user';

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

/** Give up rather than leave the learner watching a spinner forever. */
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
 * The server wraps success as { data, meta } and failure as
 * { statusCode, error, message } where `message` is a string OR an array of
 * validation messages. Flatten both into a plain object / ApiError.
 */
async function request(method, path, body) {
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
    const raw = payload?.message;
    const fieldErrors = Array.isArray(raw) ? raw : [];
    const message =
      (fieldErrors.length ? fieldErrors[0] : typeof raw === 'string' ? raw : null) ??
      `Something went wrong (${response.status}).`;
    throw new ApiError(message, { status: response.status, fieldErrors });
  }

  return payload?.data ?? payload ?? {};
}

const post = (path, body) => request('POST', path, body);
const get = (path) => request('GET', path);

export function signIn(identifier, password) {
  return post('/auth/signin', {
    identifier: identifier.trim(),
    password,
    role: 'learner',
  });
}

/**
 * Resolve an invite code to the account it belongs to, so the activation screen
 * can fill in the email. Throws ApiError(404) once the code has been used.
 */
export function lookupInvite(inviteCode) {
  return get(`/auth/invite/${encodeURIComponent(inviteCode.trim().toUpperCase())}`);
}

/**
 * Redeem an invite code: sets the password, activates the account and returns
 * a session, so an invited learner goes straight in without a second sign-in.
 */
export async function activateAccount(identifier, inviteCode, password) {
  const res = await post('/auth/activate', {
    identifier: identifier.trim(),
    inviteCode: inviteCode.trim().toUpperCase(),
    password,
    acceptTerms: true,
    // This app only serves learners: the server refuses any other role's invite
    // rather than activating someone into an app that shows them nothing.
    role: 'learner',
  });

  // Backstop. The server is the real gate, but never hold a session for someone
  // this app cannot serve — not even if an older server let it through.
  if (res?.user?.role !== 'learner') {
    throw new ApiError(
      `That invite is for a ${String(res?.user?.role ?? 'different').replace(/_/g, ' ')} account. ` +
        'Open the IGNITE app for that role to sign in.',
      { status: 403 },
    );
  }
  return res;
}
