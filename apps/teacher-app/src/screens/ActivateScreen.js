import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { IconUser, IconLock, IconChevronLeft, IconGem } from '../components/Icon';
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
import { activateAccount, lookupInvite, storeSession, ApiError } from '../api/auth';

/** Mirrors ActivateDto on the server so we fail fast, before a round trip. */
function passwordProblem(password, confirm) {
  if (password.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Include at least one letter and one number.';
  }
  if (password !== confirm) return 'The two passwords do not match.';
  return null;
}

export default function ActivateScreen({ onActivated, onCancel, showToast, topInset = 0 }) {
  const { colors } = useTheme();

  const [identifier, setIdentifier] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [focus, setFocus] = useState(null);

  const codeRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  // Set once the email came from a code lookup rather than the keyboard, so a
  // later lookup may replace it but anything typed by hand is never overwritten.
  const emailWasFilled = useRef(false);
  const [lookingUp, setLookingUp] = useState(false);
  // Role of the invite when it belongs to someone this app cannot serve.
  const [wrongRole, setWrongRole] = useState(null);

  const HOME_FOR_ROLE = {
    learner: 'the IGNITE Learner app',
    parent: 'the IGNITE Parent app',
    principal: 'the IGNITE school portal',
    platform_admin: 'the IGNITE admin portal',
    curriculum_admin: 'the IGNITE admin portal',
  };

  // Codes are 12 characters; look up as soon as one is complete and fill in the
  // address it was issued to. Debounced so pasting does not fire a request per
  // keystroke, and silent on failure — a wrong code is the submit button's job
  // to report, not something to nag about mid-typing.
  useEffect(() => {
    const code = inviteCode.trim();
    if (code.length < 12) return undefined;
    if (identifier.trim() && !emailWasFilled.current) return undefined;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLookingUp(true);
      try {
        const invite = await lookupInvite(code);
        if (cancelled) return;
        // This app is for teachers only. Say so as soon as the code identifies
        // someone else, rather than after a password has been typed.
        if (invite?.role && invite.role !== 'teacher') {
          setWrongRole(invite.role);
          setIdentifier('');
          emailWasFilled.current = false;
          return;
        }
        setWrongRole(null);
        if (invite?.email) {
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
  }, [inviteCode]);

  const submit = useCallback(async () => {
    if (wrongRole) {
      setErr(
        `That code is for a ${wrongRole.replace(/_/g, ' ')} account. ` +
          `Open ${HOME_FOR_ROLE[wrongRole] ?? 'the IGNITE app for that role'} instead.`,
      );
      return;
    }
    const id = identifier.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)) {
      setErr('Enter the email address your school registered.');
      return;
    }
    if (!inviteCode.trim()) {
      setErr('Enter the invite code from your email.');
      return;
    }
    const problem = passwordProblem(password, confirm);
    if (problem) {
      setErr(problem);
      return;
    }

    setErr('');
    setBusy(true);
    try {
      const res = await activateAccount(id, inviteCode, password);
      await storeSession(res.accessToken, res.user);
      if (showToast) showToast('Account activated');
      onActivated(res.user);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not activate the account.');
    } finally {
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier, inviteCode, password, confirm, wrongRole, onActivated, showToast]);

  const hero = (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Back to sign in"
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
          New account
        </Text>
      </View>

      <View style={{ marginTop: 'auto' }}>
        <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 25, color: ON_HERO }}>
          Activate account
        </Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: ON_HERO_MUTED, marginTop: 4 }}>
          Use the invite code your school sent you
        </Text>
      </View>
    </>
  );

  return (
    <AuthLayout topInset={topInset} hero={hero}>
      <AuthHeading
        title="Set your password"
        sub="Your school created the account. Enter the code from your invite email, then choose a password."
      />

      <View style={{ gap: 16 }}>
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
          textContentType="emailAddress"
          returnKeyType="next"
          focused={focus === 'id'}
          onFocus={() => setFocus('id')}
          onBlur={() => setFocus(null)}
          onSubmitEditing={() => codeRef.current?.focus()}
        />

        <AuthField
          label="Invite code"
          icon={<IconGem />}
          inputRef={codeRef}
          value={inviteCode}
          onChangeText={(t) => {
            setInviteCode(t.toUpperCase());
            setWrongRole(null);
            if (err) setErr('');
          }}
          hint={
            wrongRole
              ? `This code is for a ${wrongRole.replace(/_/g, ' ')} account. Open ${
                  HOME_FOR_ROLE[wrongRole] ?? 'the IGNITE app for that role'
                } to activate it.`
              : undefined
          }
          hintTone="warning"
          placeholder="Type invite code"
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="next"
          focused={focus === 'code'}
          onFocus={() => setFocus('code')}
          onBlur={() => setFocus(null)}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        <AuthField
          label="Create password"
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
          placeholder="Retype password"
          secureTextEntry={!reveal}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          focused={focus === 'confirm'}
          onFocus={() => setFocus('confirm')}
          onBlur={() => setFocus(null)}
          onSubmitEditing={submit}
        />
      </View>

      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 12,
          lineHeight: 18,
          color: colors.textSubtle,
          marginTop: 14,
        }}
      >
        At least 8 characters, including a letter and a number.
      </Text>

      {err ? <AuthNotice style={{ marginTop: 14 }}>{err}</AuthNotice> : null}

      <AuthButton
        label="Activate and sign in"
        busy={busy}
        onPress={submit}
        style={{ marginTop: 20 }}
      />

      <AuthTextLink label="Back to sign in" onPress={onCancel} style={{ marginTop: 20 }} />

      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 12.5,
          lineHeight: 19,
          textAlign: 'center',
          color: colors.textSubtle,
          marginTop: 16,
        }}
      >
        No invite code? Ask your school admin to resend it.
      </Text>
    </AuthLayout>
  );
}
