import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { IconUser, IconLock, IconChevronLeft } from '../components/Icon';
import {
  AuthLayout,
  AuthHeading,
  AuthField,
  AuthButton,
  AuthNotice,
  AuthTextLink,
  ON_HERO,
  ON_HERO_MUTED,
  ON_HERO_LINE,
  ON_HERO_FILL,
} from '../components/auth-ui';
import {
  requestPasswordResetCode,
  verifyPasswordResetCode,
  resetPassword,
  ApiError,
} from '../api/auth';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

const STEPS = [
  { key: 'email', label: 'Email' },
  { key: 'code', label: 'Code' },
  { key: 'password', label: 'New password' },
];

/** Mirrors the server's ResetPasswordDto rules so we fail fast, offline. */
function passwordProblem(password, confirm) {
  if (password.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Include at least one letter and one number.';
  }
  if (password !== confirm) return 'The two passwords do not match.';
  return null;
}

/** Six tappable boxes backed by one hidden input. */
function CodeInput({ value, onChange, onComplete, autoFocus }) {
  const { colors } = useTheme();
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  const digits = value.padEnd(CODE_LENGTH, ' ').split('').slice(0, CODE_LENGTH);
  const cursor = Math.min(value.length, CODE_LENGTH - 1);

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      accessibilityLabel={`Verification code, ${value.length} of ${CODE_LENGTH} digits entered`}
      style={{ flexDirection: 'row', gap: 8 }}
    >
      {digits.map((digit, i) => {
        const active = focused && i === cursor;
        const filled = digit !== ' ';
        return (
          <View
            key={i}
            style={{
              flex: 1,
              aspectRatio: 0.82,
              maxHeight: 62,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: active
                ? colors.brand
                : filled
                ? colors.brand
                : colors.border,
              borderRadius: 12,
              backgroundColor: filled ? colors.surface : colors.surface2,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.display800,
                fontWeight: '800',
                fontSize: 22,
                color: colors.text,
              }}
            >
              {filled ? digit : ''}
            </Text>
          </View>
        );
      })}

      {/* The real input sits invisibly on top so taps anywhere focus it. */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => {
          const next = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
          onChange(next);
          if (next.length === CODE_LENGTH) onComplete?.(next);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={CODE_LENGTH}
        style={[StyleSheet.absoluteFill, { opacity: 0 }]}
      />
    </Pressable>
  );
}

export default function ForgotPasswordScreen({ onDone, onCancel, showToast, topInset = 0 }) {
  const { colors } = useTheme();

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [reveal, setReveal] = useState(false);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [devCode, setDevCode] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [focus, setFocus] = useState(null);

  const confirmRef = useRef(null);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendCode = useCallback(
    async (isResend) => {
      const address = email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
        setErr('Enter the email address on your IGNITE account.');
        return;
      }
      setErr('');
      setBusy(true);
      try {
        const res = await requestPasswordResetCode(address);
        setDevCode(res.devCode ?? null);
        setCooldown(RESEND_COOLDOWN_SECONDS);
        setCode('');
        setStep(1);
        if (isResend && showToast) showToast('New code sent');
      } catch (e) {
        setErr(e instanceof ApiError ? e.message : 'Could not send the code.');
      } finally {
        setBusy(false);
      }
    },
    [email, showToast],
  );

  const submitCode = useCallback(
    async (entered) => {
      const value = entered ?? code;
      if (value.length !== CODE_LENGTH) {
        setErr(`Enter all ${CODE_LENGTH} digits.`);
        return;
      }
      setErr('');
      setBusy(true);
      try {
        const res = await verifyPasswordResetCode(email, value);
        setToken(res.token);
        setStep(2);
      } catch (e) {
        setCode('');
        setErr(e instanceof ApiError ? e.message : 'Could not check the code.');
      } finally {
        setBusy(false);
      }
    },
    [code, email],
  );

  const submitPassword = useCallback(async () => {
    const problem = passwordProblem(password, confirm);
    if (problem) {
      setErr(problem);
      return;
    }
    setErr('');
    setBusy(true);
    try {
      await resetPassword(token, password, confirm);
      if (showToast) showToast('Password updated. Sign in');
      onDone(email.trim());
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not update the password.');
      // An expired/consumed token means starting over from the code step.
      if (e instanceof ApiError && e.status === 400 && /token/i.test(e.message)) {
        setToken(null);
        setStep(1);
        setCode('');
      }
    } finally {
      setBusy(false);
    }
  }, [password, confirm, token, email, onDone, showToast]);

  function goBack() {
    setErr('');
    if (step === 0) {
      onCancel();
    } else if (step === 1) {
      setStep(0);
      setCode('');
    } else {
      setStep(1);
      setCode('');
      setToken(null);
    }
  }

  const hero = (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => ({
            width: 38,
            height: 38,
            borderRadius: 13,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: ON_HERO_FILL,
            borderWidth: 1,
            borderColor: ON_HERO_LINE,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <IconChevronLeft size={18} color={ON_HERO} />
        </Pressable>
        <Text
          style={{
            marginLeft: 12,
            fontFamily: fonts.body700,
            fontWeight: '700',
            fontSize: 10.5,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: ON_HERO_MUTED,
          }}
        >
          Step {step + 1} of {STEPS.length}
        </Text>
      </View>

      <View style={{ marginTop: 'auto' }}>
        <Text
          style={{
            fontFamily: fonts.display,
            fontWeight: '900',
            fontSize: 25,
            color: ON_HERO,
          }}
        >
          Password reset
        </Text>
        {/* Progress rail: each segment is one completed or current step. */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 14 }}>
          {STEPS.map((s, i) => (
            <View
              key={s.key}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: i <= step ? ON_HERO : ON_HERO_LINE,
              }}
            />
          ))}
        </View>
      </View>
    </>
  );

  return (
    <AuthLayout topInset={topInset} hero={hero}>
      {step === 0 ? (
        <>
          <AuthHeading
            title="Forgot your password?"
            sub="Enter the email address on your IGNITE account and we'll send a 6-digit code."
          />
          <AuthField
            label="Email"
            icon={<IconUser />}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (err) setErr('');
            }}
            placeholder="Type email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="send"
            focused={focus === 'email'}
            onFocus={() => setFocus('email')}
            onBlur={() => setFocus(null)}
            onSubmitEditing={() => sendCode(false)}
          />
          {err ? <AuthNotice style={{ marginTop: 18 }}>{err}</AuthNotice> : null}
          <AuthButton
            label="Send code"
            busy={busy}
            onPress={() => sendCode(false)}
            style={{ marginTop: 22 }}
          />
          <AuthTextLink label="Back to sign in" onPress={onCancel} style={{ marginTop: 20 }} />
        </>
      ) : null}

      {step === 1 ? (
        <>
          <AuthHeading
            title="Enter the code"
            sub={`We sent a ${CODE_LENGTH}-digit code to ${email.trim()}. It expires in 10 minutes.`}
          />
          <CodeInput
            value={code}
            onChange={(v) => {
              setCode(v);
              if (err) setErr('');
            }}
            onComplete={(v) => submitCode(v)}
            autoFocus
          />

          {devCode ? (
            <AuthNotice tone="info" style={{ marginTop: 18 }}>
              {`No mail server configured on the API, so nothing was emailed. Your code is ${devCode}. Set SMTP_HOST in apps/server/.env to send real messages.`}
            </AuthNotice>
          ) : null}

          {err ? <AuthNotice style={{ marginTop: 18 }}>{err}</AuthNotice> : null}

          <AuthButton
            label="Verify code"
            busy={busy}
            disabled={code.length !== CODE_LENGTH}
            onPress={() => submitCode()}
            style={{ marginTop: 22 }}
          />

          <View style={{ alignItems: 'center', marginTop: 20 }}>
            {cooldown > 0 ? (
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 13.5,
                  color: colors.textSubtle,
                }}
              >
                {`Resend code in ${cooldown}s`}
              </Text>
            ) : (
              <AuthTextLink label="Send a new code" onPress={() => sendCode(true)} />
            )}
          </View>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <AuthHeading
            title="Choose a new password"
            sub="At least 8 characters, including a letter and a number."
          />
          <View style={{ gap: 16 }}>
            <AuthField
              label="New password"
              icon={<IconLock />}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (err) setErr('');
              }}
              placeholder="Type new password"
              secureTextEntry={!reveal}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              focused={focus === 'pw'}
              onFocus={() => setFocus('pw')}
              onBlur={() => setFocus(null)}
              onSubmitEditing={() => confirmRef.current?.focus()}
              trailing={
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
                      fontFamily: fonts.body700,
                      fontWeight: '700',
                      fontSize: 11.5,
                      color: colors.brand,
                    }}
                  >
                    {reveal ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              }
            />
            <AuthField
              label="Confirm password"
              icon={<IconLock />}
              inputRef={confirmRef}
              value={confirm}
              onChangeText={(t) => {
                setConfirm(t);
                if (err) setErr('');
              }}
              placeholder="Retype new password"
              secureTextEntry={!reveal}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              focused={focus === 'confirm'}
              onFocus={() => setFocus('confirm')}
              onBlur={() => setFocus(null)}
              onSubmitEditing={submitPassword}
            />
          </View>

          {err ? <AuthNotice style={{ marginTop: 18 }}>{err}</AuthNotice> : null}

          <AuthButton
            label="Update password"
            busy={busy}
            onPress={submitPassword}
            style={{ marginTop: 22 }}
          />
        </>
      ) : null}
    </AuthLayout>
  );
}
