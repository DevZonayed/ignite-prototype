import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { IgniteGradient } from '../components/ui';

// Mirrors design/pages/auth.html: identifier + password, teacher role fixed.
export default function SignInScreen({ onSignedIn, showToast }) {
  const { colors } = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  function submit() {
    if (!identifier.trim()) {
      setErr('Enter your email or phone.');
      return;
    }
    if (password.length < 4) {
      setErr('Enter your password.');
      return;
    }
    setErr('');
    setBusy(true);
    // No API client wired yet — see apps/README. Local session only.
    setTimeout(() => {
      setBusy(false);
      onSignedIn({ name: identifier.trim(), role: 'Teacher' });
      if (showToast) showToast('Signed in');
    }, 450);
  }

  const inputStyle = {
    width: '100%',
    fontFamily: fonts.body,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 11,
    backgroundColor: colors.surface,
    color: colors.text,
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 30 }}>
      <View style={{ alignItems: 'center', marginBottom: 26 }}>
        <IgniteGradient style={{ width: 54, height: 54, marginBottom: 12 }} radius={15} />
        <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 22, color: colors.text }}>
          IGNITE
        </Text>
      </View>

      <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 25, color: colors.text, marginBottom: 6 }}>
        Welcome back
      </Text>
      <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 24 }}>
        Sign in to your teacher account.
      </Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 13, fontFamily: fonts.body700, fontWeight: '700', color: colors.text, marginBottom: 7 }}>
          Email or phone
        </Text>
        <TextInput
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="Email or phone"
          placeholderTextColor={colors.textSubtle}
          autoCapitalize="none"
          keyboardType="email-address"
          style={inputStyle}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 13, fontFamily: fonts.body700, fontWeight: '700', color: colors.text, marginBottom: 7 }}>
          Password
        </Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textSubtle}
            secureTextEntry={!reveal}
            autoCapitalize="none"
            style={[inputStyle, { paddingRight: 62 }]}
            onSubmitEditing={submit}
          />
          <Pressable
            onPress={() => setReveal((r) => !r)}
            style={{ position: 'absolute', right: 10, top: 0, bottom: 0, justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 12, fontFamily: fonts.body700, fontWeight: '700', color: colors.brand }}>
              {reveal ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        </View>
      </View>

      {err ? (
        <Text style={{ color: colors.danger, fontSize: 12.5, marginBottom: 12 }}>{err}</Text>
      ) : null}

      <Pressable
        onPress={submit}
        disabled={busy}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 14,
          borderRadius: 12,
          backgroundColor: colors.brand,
          opacity: busy ? 0.7 : 1,
          minHeight: 48,
        }}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ fontFamily: fonts.display800, fontWeight: '800', fontSize: 15, color: '#fff' }}>
            Sign in
          </Text>
        )}
      </Pressable>
    </View>
  );
}
