import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, AccessibilityInfo } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts, igniteGrad } from '../theme';
import { IgniteGradient } from '../components/ui';
import { signIn, storeSession, ApiError } from '../api/auth';
import { IconUser, IconLock, IconCheck, IconSun, IconMoon } from '../components/Icon';
import {
  AuthLayout,
  AuthHeading,
  AuthField,
  AuthButton,
  AuthNotice,
  AuthTextLink,
  SparkMark,
  ON_HERO,
  ON_HERO_MUTED,
  ON_HERO_LINE,
  ON_HERO_FILL,
} from '../components/auth-ui';

export default function SignInScreen({
  onSignedIn,
  onForgotPassword,
  onActivate,
  showToast,
  topInset = 0,
  initialIdentifier = '',
}) {
  const { colors, mode, toggle } = useTheme();

  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [focus, setFocus] = useState(null);

  const passwordRef = useRef(null);
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

  const rise = enter.interpolate({ inputRange: [0, 1], outputRange: [22, 0] });

  async function submit() {
    const id = identifier.trim();
    if (!id) {
      setErr('Enter the email or phone number your school registered.');
      return;
    }
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id);
    const looksLikePhone = /^[+()\d][\d\s-()]{6,}$/.test(id);
    if (!looksLikeEmail && !looksLikePhone) {
      setErr('That does not look like an email address or phone number.');
      return;
    }
    if (!password) {
      setErr('Enter your password.');
      return;
    }

    setErr('');
    setBusy(true);
    try {
      const res = await signIn(id, password);
      await storeSession(res.accessToken, res.user);
      onSignedIn(res.user);
      if (showToast) showToast('Signed in');
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  const hero = (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: ON_HERO_FILL,
            borderWidth: 1,
            borderColor: ON_HERO_LINE,
            borderRadius: 999,
            paddingVertical: 5,
            paddingHorizontal: 11,
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: igniteGrad[1] }} />
          <Text
            style={{
              fontFamily: fonts.body700,
              fontWeight: '700',
              fontSize: 10.5,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: ON_HERO,
            }}
          >
            Teacher app
          </Text>
        </View>

        <Pressable
          onPress={toggle}
          accessibilityRole="button"
          accessibilityLabel={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          style={({ pressed }) => ({
            marginLeft: 'auto',
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
          {mode === 'dark' ? (
            <IconSun size={18} color={ON_HERO} />
          ) : (
            <IconMoon size={18} color={ON_HERO} />
          )}
        </Pressable>
      </View>

      <Animated.View
        style={{ marginTop: 'auto', opacity: enter, transform: [{ translateY: rise }] }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
          <IgniteGradient style={{ width: 52, height: 52 }} radius={17}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <SparkMark size={26} color="#3b1d05" />
            </View>
          </IgniteGradient>
          <View>
            <Text
              style={{
                fontFamily: fonts.display,
                fontWeight: '900',
                fontSize: 27,
                letterSpacing: 1.5,
                color: ON_HERO,
              }}
            >
              IGNITE
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: ON_HERO_MUTED }}>
              Digital Innovation Learning
            </Text>
          </View>
        </View>
      </Animated.View>
    </>
  );

  return (
    <AuthLayout topInset={topInset} hero={hero}>
      <AuthHeading
        title="Welcome back"
        sub="Sign in to reach your lessons, learners and homework."
      />

      <View style={{ gap: 16 }}>
        <AuthField
          label="Email or phone"
          icon={<IconUser />}
          value={identifier}
          onChangeText={(t) => {
            setIdentifier(t);
            if (err) setErr('');
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
          label="Password"
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
          returnKeyType="go"
          focused={focus === 'pw'}
          onFocus={() => setFocus('pw')}
          onBlur={() => setFocus(null)}
          onSubmitEditing={submit}
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
      </View>

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
          <Text style={{ fontFamily: fonts.body500, fontSize: 13.5, color: colors.textMuted }}>
            Keep me signed in
          </Text>
        </Pressable>

        <AuthTextLink
          label="Forgot password?"
          onPress={onForgotPassword}
          align="right"
          style={{ marginLeft: 'auto' }}
        />
      </View>

      {err ? <AuthNotice style={{ marginTop: 18 }}>{err}</AuthNotice> : null}

      <AuthButton label="Sign in" busy={busy} onPress={submit} style={{ marginTop: 22 }} />

      <AuthTextLink
        label="Have an invite code? Activate your account"
        onPress={onActivate}
        style={{ marginTop: 18 }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 26 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <Text style={{ fontFamily: fonts.body, fontSize: 11.5, color: colors.textSubtle }}>
          Three devices per account
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </View>

      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 12.5,
          lineHeight: 19,
          textAlign: 'center',
          color: colors.textSubtle,
          marginTop: 14,
        }}
      >
        Accounts are created by your school. Contact your school admin if you cannot get in.
      </Text>
    </AuthLayout>
  );
}
