import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, Animated, AccessibilityInfo } from 'react-native';

import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { signIn, activateAccount, lookupInvite, storeSession, ApiError } from '../api/auth';
import {
  AuthLayout,
  AuthHero,
  AuthHeading,
  AuthField,
  AuthButton,
  AuthNotice,
  AuthTextLink,
  AuthFootnote,
  IconUser,
  IconLock,
  IconKey,
  IconCheck,
} from '../components/auth-ui';

/** Mirrors the server's ActivateDto rules so a bad password fails before the round trip. */
function passwordProblem(password, confirm) {
  if (password.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Include at least one letter and one number.';
  }
  if (password !== confirm) return 'The two passwords do not match.';
  return null;
}

/**
 * Sign in, or redeem an invite code to set a password for the first time.
 *
 * Both live in one screen because a learner arrives at exactly one of them once
 * and never thinks about the difference again. The chrome is the teacher app's
 * — same hero, same sheet — so the three apps read as one product.
 */
export default function Auth({ onSignedIn, topInset = 0 }) {
  const { colors, mode, toggleTheme } = useTheme();
  const [screen, setScreen] = useState('signin'); // 'signin' | 'activate'

  const [identifier, setIdentifier] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [reveal, setReveal] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [focus, setFocus] = useState(null);

  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const enter = useRef(new Animated.Value(0)).current;

  // Set once the email came from a code lookup rather than the keyboard, so a
  // later lookup may replace it but anything typed by hand is never overwritten.
  const emailWasFilled = useRef(false);
  const [lookingUp, setLookingUp] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => {
        if (cancelled) return;
        if (reduced) {
          enter.setValue(1);
          return;
        }
        Animated.timing(enter, {
          toValue: 1,
          duration: 460,
          delay: 60,
          useNativeDriver: true,
        }).start();
      })
      .catch(() => enter.setValue(1));
    return () => {
      cancelled = true;
    };
  }, [enter]);

  // Codes are 12 characters; look up as soon as one is complete and fill in the
  // address it was issued to. Debounced so pasting does not fire a request per
  // keystroke, and silent on failure — a wrong code is the button's job to
  // report, not something to nag about mid-typing.
  useEffect(() => {
    if (screen !== 'activate') return undefined;
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
  }, [inviteCode, screen]);

  const swap = useCallback((next) => {
    setScreen(next);
    setErr('');
    setPassword('');
    setConfirm('');
    setFocus(null);
  }, []);

  const submit = useCallback(async () => {
    const id = identifier.trim();
    if (!id) {
      setErr('Enter the email your school registered.');
      return;
    }

    if (screen === 'activate') {
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
        screen === 'activate'
          ? await activateAccount(id, inviteCode, password)
          : await signIn(id, password);
      await storeSession(res.accessToken, res.user);
      onSignedIn(res.user);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }, [screen, identifier, inviteCode, password, confirm, onSignedIn]);

  const activating = screen === 'activate';
  const rise = enter.interpolate({ inputRange: [0, 1], outputRange: [22, 0] });

  const revealToggle = (
    <Pressable
      onPress={() => setReveal((r) => !r)}
      hitSlop={8}
      accessibilityRole="button"
      style={{
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 999,
        backgroundColor: colors.brandSoft,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.uiBold,
          fontWeight: '700',
          fontSize: 11.5,
          color: colors.brand,
        }}
      >
        {reveal ? 'Hide' : 'Show'}
      </Text>
    </Pressable>
  );

  return (
    <AuthLayout
      topInset={topInset}
      hero={
        <Animated.View
          style={{ flex: 1, opacity: enter, transform: [{ translateY: rise }] }}
        >
          <AuthHero badge="Learner app" mode={mode} onToggleTheme={toggleTheme} />
        </Animated.View>
      }
    >
      <AuthHeading
        title={activating ? 'Set your password' : 'Welcome back'}
        sub={
          activating
            ? 'Enter the code from your invite email, then choose a password.'
            : 'Sign in to see your projects, skills and badges.'
        }
      />

      <View style={{ gap: 16 }}>
        {activating ? (
          <AuthField
            label="Invite code"
            icon={<IconKey />}
            value={inviteCode}
            onChangeText={(t) => {
              setInviteCode(t.toUpperCase());
              if (err) setErr('');
            }}
            placeholder="Type invite code"
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="next"
            focused={focus === 'code'}
            onFocus={() => setFocus('code')}
            onBlur={() => setFocus(null)}
          />
        ) : null}

        <AuthField
          label="Email"
          icon={<IconUser />}
          value={identifier}
          onChangeText={(t) => {
            setIdentifier(t);
            emailWasFilled.current = false;
            if (err) setErr('');
          }}
          placeholder={lookingUp ? 'Finding your account…' : 'Type email'}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="next"
          focused={focus === 'id'}
          onFocus={() => setFocus('id')}
          onBlur={() => setFocus(null)}
          onSubmitEditing={() => passwordRef.current?.focus()}
          trailing={lookingUp ? <ActivityIndicator size="small" color={colors.brand} /> : null}
        />

        <AuthField
          label={activating ? 'Create password' : 'Password'}
          icon={<IconLock />}
          inputRef={passwordRef}
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (err) setErr('');
          }}
          placeholder="Type password"
          secureTextEntry={!reveal}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType={activating ? 'next' : 'go'}
          focused={focus === 'pw'}
          onFocus={() => setFocus('pw')}
          onBlur={() => setFocus(null)}
          onSubmitEditing={() => (activating ? confirmRef.current?.focus() : submit())}
          trailing={revealToggle}
        />

        {activating ? (
          <AuthField
            label="Confirm password"
            icon={<IconLock />}
            inputRef={confirmRef}
            value={confirm}
            onChangeText={(t) => {
              setConfirm(t);
              if (err) setErr('');
            }}
            placeholder="Retype password"
            secureTextEntry={!reveal}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            focused={focus === 'confirm'}
            onFocus={() => setFocus('confirm')}
            onBlur={() => setFocus(null)}
            onSubmitEditing={submit}
            hint="At least 8 characters, including a letter and a number."
          />
        ) : null}
      </View>

      {!activating ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18 }}>
          <Pressable
            onPress={() => setRemember((r) => !r)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: remember }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}
            hitSlop={6}
          >
            <View
              style={{
                width: 21,
                height: 21,
                borderRadius: 7,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1.5,
                borderColor: remember ? colors.brand : colors.border,
                backgroundColor: remember ? colors.brand : 'transparent',
              }}
            >
              {remember ? <IconCheck size={13} color="#fff" strokeWidth={3} /> : null}
            </View>
            <Text style={{ fontFamily: fonts.uiMedium, fontSize: 13.5, color: colors.textMuted }}>
              Keep me signed in
            </Text>
          </Pressable>
        </View>
      ) : null}

      {err ? <AuthNotice style={{ marginTop: 18 }}>{err}</AuthNotice> : null}

      <AuthButton
        label={activating ? 'Activate and sign in' : 'Sign in'}
        busy={busy}
        onPress={submit}
        style={{ marginTop: 22 }}
      />

      <AuthTextLink
        label={activating ? 'Back to sign in' : 'Have an invite code? Activate your account'}
        onPress={() => swap(activating ? 'signin' : 'activate')}
        style={{ marginTop: 18 }}
      />

      <AuthFootnote caption="Three devices per account">
        Accounts are created by your school. Ask your teacher if you cannot get in.
      </AuthFootnote>
    </AuthLayout>
  );
}
