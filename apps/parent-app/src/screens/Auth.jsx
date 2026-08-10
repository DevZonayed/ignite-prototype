import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../ThemeContext';
import { signIn, activateAccount, lookupInvite, storeSession, ApiError } from '../api/auth';

/** Mirrors the server's ActivateDto rules so a bad password fails before the round trip. */
function passwordProblem(password, confirm) {
  if (password.length < 8) return 'Use at least 8 characters.';
  if (!/[a-z]/.test(password)) return 'Include a lowercase letter.';
  if (!/[A-Z]/.test(password)) return 'Include an uppercase letter.';
  if (!/\d/.test(password)) return 'Include a number.';
  if (password !== confirm) return 'The two passwords do not match.';
  return null;
}

export default function Auth({ onSignedIn }) {
  const { colors, fonts } = useTheme();

  // 'signin' | 'activate' — a parent invited by the school starts on activate.
  const [mode, setMode] = useState('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onLookup() {
    const code = inviteCode.trim();
    if (!code) return;
    setError(null);
    try {
      const invite = await lookupInvite(code);
      // Fill the address in for them: the code is the thing they were sent.
      if (invite?.email) setIdentifier(invite.email);
      else if (invite?.phone) setIdentifier(invite.phone);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That invite code was not recognised.');
    }
  }

  async function submit() {
    setError(null);

    if (mode === 'activate') {
      const problem = passwordProblem(password, confirm);
      if (problem) {
        setError(problem);
        return;
      }
    }

    setBusy(true);
    try {
      const res =
        mode === 'signin'
          ? await signIn(identifier, password)
          : await activateAccount(identifier, inviteCode, password);
      await storeSession(res.accessToken, res.user);
      onSignedIn(res.user);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not reach the IGNITE server. Try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  const canSubmit =
    identifier.trim() &&
    password &&
    (mode === 'signin' || (inviteCode.trim() && confirm));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.brand, { color: colors.brand, fontFamily: fonts.display }]}>IGNITE</Text>
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.display }]}>
          {mode === 'signin' ? 'Parent sign in' : 'Activate your account'}
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted, fontFamily: fonts.ui }]}>
          {mode === 'signin'
            ? "Follow your child's progress, homework and reports."
            : 'Enter the invite code your school sent you.'}
        </Text>

        {mode === 'activate' ? (
          <>
            <Text style={[styles.label, { color: colors.textMuted }]}>Invite code</Text>
            <TextInput
              value={inviteCode}
              onChangeText={setInviteCode}
              onBlur={onLookup}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="ABCD-1234"
              placeholderTextColor={colors.textSubtle}
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
            />
          </>
        ) : null}

        <Text style={[styles.label, { color: colors.textMuted }]}>Email or phone</Text>
        <TextInput
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={colors.textSubtle}
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
        />

        <Text style={[styles.label, { color: colors.textMuted }]}>
          {mode === 'signin' ? 'Password' : 'Choose a password'}
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={colors.textSubtle}
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
        />

        {mode === 'activate' ? (
          <>
            <Text style={[styles.label, { color: colors.textMuted }]}>Confirm password</Text>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.textSubtle}
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
            />
          </>
        ) : null}

        {error ? (
          <Text style={[styles.error, { color: colors.danger, fontFamily: fonts.ui }]}>{error}</Text>
        ) : null}

        <Pressable
          disabled={!canSubmit || busy}
          onPress={submit}
          style={[
            styles.btn,
            { backgroundColor: colors.brand, opacity: !canSubmit || busy ? 0.5 : 1 },
          ]}
        >
          <Text style={[styles.btnText, { fontFamily: fonts.display }]}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Activate & sign in'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setMode((m) => (m === 'signin' ? 'activate' : 'signin'));
            setError(null);
          }}
          style={styles.switch}
        >
          <Text style={[styles.switchText, { color: colors.brand, fontFamily: fonts.ui700 }]}>
            {mode === 'signin' ? 'I have an invite code' : 'I already have a password'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 22, paddingTop: 40, paddingBottom: 40 },
  brand: { fontSize: 14, letterSpacing: 2, marginBottom: 18 },
  title: { fontSize: 26, marginBottom: 6 },
  sub: { fontSize: 13.5, lineHeight: 20, marginBottom: 22 },
  label: { fontSize: 12, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 13,
    fontSize: 14,
  },
  error: { fontSize: 13, marginTop: 14, lineHeight: 19 },
  btn: {
    marginTop: 22,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { fontSize: 15, color: '#fff' },
  switch: { marginTop: 16, alignItems: 'center' },
  switchText: { fontSize: 13 },
});
