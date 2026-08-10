import { ApiError, get, patch, post } from './client';

// Session storage and the error type live in the client, because every request
// needs them. Re-exported here so the auth screens keep importing one module.
export {
  ApiError,
  loadSession,
  storeSession,
  clearSession,
  setUnauthorizedHandler,
} from './client';

/**
 * Step 1: ask for a 6-digit code by email.
 * Always resolves for an existing-or-not account; `devCode` is only present
 * when the server has no SMTP transport configured.
 */
export function requestPasswordResetCode(identifier) {
  return post('/auth/forgot-password', { identifier: identifier.trim() });
}

/** Step 2: exchange the code for a single-use reset token. */
export function verifyPasswordResetCode(identifier, code) {
  return post('/auth/password-reset/verify-otp', {
    identifier: identifier.trim(),
    code,
  });
}

/** Step 3: set the new password using the token from step 2. */
export function resetPassword(token, newPassword, confirmPassword) {
  return post('/auth/reset-password', { token, newPassword, confirmPassword });
}

/** Sign in with the credentials an activated teacher set. */
export function signIn(identifier, password) {
  return post('/auth/signin', {
    identifier: identifier.trim(),
    password,
    role: 'teacher',
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
 * a session, so an invited teacher goes straight in without a second sign-in.
 */
export async function activateAccount(identifier, inviteCode, password) {
  const res = await post('/auth/activate', {
    identifier: identifier.trim(),
    inviteCode: inviteCode.trim().toUpperCase(),
    password,
    acceptTerms: true,
    // This app only serves teachers: the server refuses any other role's invite
    // rather than activating someone into an app that shows them nothing.
    role: 'teacher',
  });

  // Backstop. The server is the real gate, but never hold a session for someone
  // this app cannot serve — not even if an older server let it through.
  if (res?.user?.role !== 'teacher') {
    throw new ApiError(
      `That invite is for a ${String(res?.user?.role ?? 'different').replace(/_/g, ' ')} account. ` +
        'Open the IGNITE app for that role to sign in.',
      { status: 403 },
    );
  }
  return res;
}

/** The signed-in teacher, refetched from the server. */
export function fetchMe() {
  return get('/auth/me');
}

/** Profile fields the teacher may change (name, theme preference, and so on). */
export function updateMe(body) {
  return patch('/auth/me', body);
}

export function changePassword(currentPassword, newPassword, confirmPassword) {
  return post('/auth/me/password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
}
