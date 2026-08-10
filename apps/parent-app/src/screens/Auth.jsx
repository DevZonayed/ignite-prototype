import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, AccessibilityInfo } from 'react-native';

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
  if (!/[a-z]/.test(password)) return 'Include a lowercase letter.';
  if (!/[A-Z]/.test(password)) return 'Include an uppercase letter.';
  if (!/\d/.test(password)) return 'Include a number.';
  if (password !== confirm) return 'The two passwords do not match.';
  return null;
}

/**
 * Sign in, or redeem an invite code the school sent.
 *
 * Chrome is the teacher app's — same hero, same sheet — so the three apps read
 * as one product.
 */
export default function Auth({ onSignedIn, topInset = 0 }) {
  const { colors, mode: themeMode, toggleTheme } = useTheme();

  // 'signin' | 'activate' — a parent invited by the school starts on activate.
  const [mode, setMode] = useState('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [confirm, setConfirm] = useState('');
  const [reveal, setReveal] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [focus, setFocus] = useState(null);

  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const enter = useRef(new Animated.Value(0)).current;

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

  const activating = mode === 'activate';
  const canSubmit =
    identifier.trim() && password && (!activating || (inviteCode.trim() && confirm));
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
          fontFamily: fonts.ui700,
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
        <Animated.View style={{ flex: 1, opacity: enter, transform: [{ translateY: rise }] }}>
          <AuthHero badge="Parent app" mode={themeMode} onToggleTheme={toggleTheme} />
        </Animated.View>
      }
    >
      <AuthHeading
        title={activating ? 'Activate your account' : 'Parent sign in'}
        sub={
          activating
            ? 'Enter the invite code your school sent you, then choose a password.'
            : "Follow your child's progress, homework and reports."
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
              if (error) setError(null);
            }}
            onBlur={() => {
              setFocus(null);
              onLookup();
            }}
            placeholder="Type invite code"
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="next"
            focused={focus === 'code'}
            onFocus={() => setFocus('code')}
          />
        ) : null}

        <AuthField
          label="Email or phone"
          icon={<IconUser />}
          value={identifier}
          onChangeText={(t) => {
            setIdentifier(t);
            if (error) setError(null);
          }}
          placeholder="Type email or phone"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="next"
          focused={focus === 'id'}
          onFocus={() => setFocus('id')}
          onBlur={() => setFocus(null)}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        <AuthField
          label={activating ? 'Choose a password' : 'Password'}
          icon={<IconLock />}
          inputRef={passwordRef}
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (error) setError(null);
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
              if (error) setError(null);
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
            hint="At least 8 characters, with an uppercase letter, a lowercase letter and a number."
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
            <Text style={{ fontFamily: fonts.ui500, fontSize: 13.5, color: colors.textMuted }}>
              Keep me signed in
            </Text>
          </Pressable>
        </View>
      ) : null}

      {error ? <AuthNotice style={{ marginTop: 18 }}>{error}</AuthNotice> : null}

      <AuthButton
        label={activating ? 'Activate and sign in' : 'Sign in'}
        busy={busy}
        disabled={!canSubmit}
        onPress={submit}
        style={{ marginTop: 22 }}
      />

      <AuthTextLink
        label={activating ? 'Back to sign in' : 'I have an invite code'}
        onPress={() => {
          setMode((m) => (m === 'signin' ? 'activate' : 'signin'));
          setError(null);
          setPassword('');
          setConfirm('');
          setFocus(null);
        }}
        style={{ marginTop: 18 }}
      />

      <AuthFootnote caption="Linked to your child by the school">
        Your school creates parent accounts. Contact them if you cannot get in.
      </AuthFootnote>
    </AuthLayout>
  );
}
