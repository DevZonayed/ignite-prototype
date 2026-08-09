import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { useTheme } from '../ThemeContext';
import { fonts, igniteGradient } from '../theme';
import Gradient from '../components/Gradient';
import { signIn, activateAccount, lookupInvite, storeSession, ApiError } from '../api/auth';

/** Mirrors the server's ActivateDto rules so a bad password fails before the round trip. */
function passwordProblem(password, confirm) {
  if (password.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Include at least one letter and one number.';
  }
  if (password !== confirm) return 'The two passwords do not match.';
  return null;
}

function Field({ label, hint, children }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 13 }}>
      <Text style={[styles.label, { color: colors.textSubtle }]}>{label}</Text>
      {children}
      {hint ? <Text style={[styles.hint, { color: colors.textSubtle }]}>{hint}</Text> : null}
    </View>
  );
}

/**
 * Sign in, or redeem an invite code to set a password for the first time.
 *
 * Both live in one screen because a learner arrives at exactly one of them once
 * and never thinks about the difference again.
 */
export default function Auth({ onSignedIn }) {
  const { colors } = useTheme();
  const [mode, setMode] = useState('signin'); // 'signin' | 'activate'

  const [identifier, setIdentifier] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // Set once the email came from a code lookup rather than the keyboard, so a
  // later lookup may replace it but anything typed by hand is never overwritten.
  const emailWasFilled = useRef(false);
  const [lookingUp, setLookingUp] = useState(false);

  // Codes are 12 characters; look up as soon as one is complete and fill in the
  // address it was issued to. Debounced so pasting does not fire a request per
  // keystroke, and silent on failure — a wrong code is the button's job to
  // report, not something to nag about mid-typing.
  useEffect(() => {
    if (mode !== 'activate') return undefined;
    const code = inviteCode.trim();
    if (code.length < 12) return undefined;
    if (identifier.trim() && !emailWasFilled.current) return undefined;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLookingUp(true);
      try {
        const invite = await lookupInvite(code);
        if (!cancelled && invite?.email) {
          setIdentifier(invite.email);
          emailWasFilled.current = true;
          setErr('');
        }
      } catch {
        // Unknown or spent code: leave the field alone.
      } finally {
        if (!cancelled) setLookingUp(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteCode, mode]);

  const swap = useCallback((next) => {
    setMode(next);
    setErr('');
    setPassword('');
    setConfirm('');
  }, []);

  const submit = useCallback(async () => {
    const id = identifier.trim();
    if (!id) {
      setErr('Enter the email your school registered.');
      return;
    }

    if (mode === 'activate') {
      if (!inviteCode.trim()) {
        setErr('Enter the invite code from your email.');
        return;
      }
      const problem = passwordProblem(password, confirm);
      if (problem) {
        setErr(problem);
        return;
      }
    } else if (!password) {
      setErr('Enter your password.');
      return;
    }

    setErr('');
    setBusy(true);
    try {
      const res =
        mode === 'activate'
          ? await activateAccount(id, inviteCode, password)
          : await signIn(id, password);
      await storeSession(res.accessToken, res.user);
      onSignedIn(res.user);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }, [mode, identifier, inviteCode, password, confirm, onSignedIn]);

  const activating = mode === 'activate';

  const input = (extra) => [
    styles.input,
    {
      backgroundColor: colors.surface2,
      borderColor: colors.border,
      color: colors.text,
      fontFamily: fonts.ui,
    },
    extra,
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ alignItems: 'center', marginTop: 18, marginBottom: 22 }}>
        <Gradient colors={igniteGradient} borderRadius={18} style={styles.mark}>
          <Text style={styles.markStar}>★</Text>
        </Gradient>
        <Text style={[styles.brand, { color: colors.text }]}>IGNITE</Text>
        <Text style={[styles.brandSub, { color: colors.textMuted }]}>
          Digital Innovation Learning
        </Text>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {activating ? 'Set your password' : 'Welcome back'}
      </Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>
        {activating
          ? 'Enter the code from your invite email, then choose a password.'
          : 'Sign in to see your projects, skills and badges.'}
      </Text>

      <View style={{ height: 18 }} />

      {activating ? (
        <Field label="INVITE CODE">
          <TextInput
            style={input()}
            value={inviteCode}
            onChangeText={(t) => {
              setInviteCode(t.toUpperCase());
              if (err) setErr('');
            }}
            placeholder="Type invite code"
            placeholderTextColor={colors.textSubtle}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </Field>
      ) : null}

      <Field label="EMAIL">
        <View>
          <TextInput
            style={input()}
            value={identifier}
            onChangeText={(t) => {
              setIdentifier(t);
              emailWasFilled.current = false;
              if (err) setErr('');
            }}
            placeholder={lookingUp ? 'Finding your account…' : 'Type email'}
            placeholderTextColor={colors.textSubtle}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          {lookingUp ? (
            <ActivityIndicator
              size="small"
              color={colors.brand}
              style={{ position: 'absolute', right: 12, top: 14 }}
            />
          ) : null}
        </View>
      </Field>

      <Field label={activating ? 'CREATE PASSWORD' : 'PASSWORD'}>
        <TextInput
          style={input()}
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (err) setErr('');
          }}
          placeholder="Type password"
          placeholderTextColor={colors.textSubtle}
          secureTextEntry
          autoCapitalize="none"
        />
      </Field>

      {activating ? (
        <Field label="CONFIRM PASSWORD" hint="At least 8 characters, including a letter and a number.">
          <TextInput
            style={input()}
            value={confirm}
            onChangeText={(t) => {
              setConfirm(t);
              if (err) setErr('');
            }}
            placeholder="Retype password"
            placeholderTextColor={colors.textSubtle}
            secureTextEntry
            autoCapitalize="none"
          />
        </Field>
      ) : null}

      {err ? (
        <Text
          style={[
            styles.err,
            { color: colors.danger, borderColor: colors.danger, backgroundColor: colors.surface },
          ]}
        >
          {err}
        </Text>
      ) : null}

      <Pressable
        onPress={submit}
        disabled={busy}
        style={({ pressed }) => [
          styles.cta,
          { backgroundColor: colors.brand, opacity: busy || pressed ? 0.75 : 1 },
        ]}
      >
        <Text style={styles.ctaText}>
          {busy
            ? 'Please wait…'
            : activating
              ? 'Activate and sign in'
              : 'Sign in'}
        </Text>
      </Pressable>

      <Pressable onPress={() => swap(activating ? 'signin' : 'activate')} style={{ marginTop: 18 }}>
        <Text style={[styles.link, { color: colors.brand }]}>
          {activating ? 'Back to sign in' : 'Have an invite code? Activate your account'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  markStar: { fontSize: 26, color: '#FFFFFF' },
  brand: { fontFamily: fonts.display, fontWeight: '900', fontSize: 26, letterSpacing: 1 },
  brandSub: { fontSize: 12.5, marginTop: 2 },
  title: { fontFamily: fonts.display, fontWeight: '900', fontSize: 25 },
  sub: { fontSize: 13.5, marginTop: 5, lineHeight: 20 },
  label: {
    fontFamily: fonts.uiSemibold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  hint: { fontSize: 11.5, marginTop: 6 },
  err: {
    borderWidth: 1,
    borderRadius: 11,
    padding: 11,
    fontSize: 13,
    marginBottom: 13,
  },
  cta: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontFamily: fonts.uiBold,
    fontWeight: '700',
    fontSize: 15.5,
  },
  link: {
    textAlign: 'center',
    fontFamily: fonts.uiSemibold,
    fontWeight: '600',
    fontSize: 13.5,
  },
});
