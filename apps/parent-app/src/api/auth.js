import { ApiError, get, post } from './client';

// Session storage and the error type live in the client, because every request
// needs them. Re-exported here so the auth screen imports one module.
export {
  ApiError,
  loadSession,
  storeSession,
  clearSession,
  setUnauthorizedHandler,
} from './client';

/**
 * Sign in with the credentials the school issued.
 *
 * Password only. The server's OTP endpoints are a step-up flow for school
 * owners keyed by userId, not an email-based login a parent could start from
 * this screen.
 */
export function signIn(identifier, password) {
  return post('/auth/signin', {
    identifier: identifier.trim(),
    password,
    role: 'parent',
  });
}

/**
 * Resolve an invite code to the account it belongs to, so the activation form
 * can fill in the address. Throws ApiError(404) once the code has been used.
 */
export function lookupInvite(inviteCode) {
  return get(`/auth/invite/${encodeURIComponent(inviteCode.trim().toUpperCase())}`);
}

/** Redeem an invite: sets the password and returns a session in one step. */
export async function activateAccount(identifier, inviteCode, password) {
  const res = await post('/auth/activate', {
    identifier: identifier.trim(),
    inviteCode: inviteCode.trim().toUpperCase(),
    password,
    acceptTerms: true,
    role: 'parent',
  });

  // Backstop. The server is the real gate, but never hold a session for someone
  // this app cannot serve.
  if (res?.user?.role !== 'parent') {
    throw new ApiError(
      `That invite is for a ${String(res?.user?.role ?? 'different').replace(/_/g, ' ')} account. ` +
        'Open the IGNITE app for that role to sign in.',
      { status: 403 },
    );
  }
  return res;
}
