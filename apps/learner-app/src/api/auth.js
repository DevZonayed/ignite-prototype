import { ApiError, get, post } from './client';

// Session storage and the error type live in the client, because every request
// needs them. Re-exported here so the auth screen keeps importing one module.
export {
  ApiError,
  loadSession,
  storeSession,
  clearSession,
  setUnauthorizedHandler,
} from './client';

/** Sign in with the credentials an activated learner set. */
export function signIn(identifier, password) {
  return post('/auth/signin', {
    identifier: identifier.trim(),
    password,
    role: 'learner',
  });
}

/**
 * Resolve an invite code to the account it belongs to, so the activation form
 * can fill in the address. Throws ApiError(404) once the code has been used.
 */
export function lookupInvite(inviteCode) {
  return get(`/auth/invite/${encodeURIComponent(inviteCode.trim().toUpperCase())}`);
}

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
