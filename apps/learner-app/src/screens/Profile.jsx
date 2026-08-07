import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts, igniteGradient } from '../theme';
import { badges } from '../data';
import Gradient from '../components/Gradient';
import { SecTitle } from '../components/common';
import { AwardIcon, LockIcon, SunDotIcon } from '../components/Icon';

export default function Profile({ onOpenCertificate }) {
  const { colors, mode, toggleTheme } = useTheme();
  const isDark = mode === 'dark';

  return (
    <View>
      {/* apphead */}
      <View style={styles.apphead}>
        <Gradient colors={igniteGradient} style={styles.av} borderRadius={23}>
          <Text style={styles.avText}>A</Text>
        </Gradient>
        <View>
          <Text style={[styles.hi, { color: colors.text }]}>Amara Eze</Text>
          <Text style={[styles.sub, { color: colors.textSubtle }]}>
            JSS 1 · Bright Future Academy
          </Text>
        </View>
      </View>

      <SecTitle>Badges</SecTitle>
      <View style={styles.bgrid}>
        {badges.map((b, i) => {
          const earned = !!b[1];
          return (
            <View key={i} style={styles.bg}>
              {earned ? (
                <Gradient colors={igniteGradient} style={styles.disc} borderRadius={28}>
                  <AwardIcon size={24} color="#fff" strokeWidth={2} />
                </Gradient>
              ) : (
                <View style={[styles.disc, { backgroundColor: colors.surface2 }]}>
                  <LockIcon size={22} color="#94a3b8" strokeWidth={2} />
                </View>
              )}
              <Text
                style={[
                  styles.bn,
                  { color: earned ? colors.text : colors.textSubtle },
                ]}
              >
                {b[0]}
              </Text>
            </View>
          );
        })}
      </View>

      <SecTitle>Certificate</SecTitle>
      <Pressable
        onPress={onOpenCertificate}
        style={[styles.certcard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.certInner}>
          <Text style={[styles.certBrand, { color: colors.brand }]}>IGNITE</Text>
          <Text style={[styles.certTitle, { color: colors.text }]}>
            Certificate of Achievement
          </Text>
          <Text style={[styles.certMeta, { color: colors.textMuted }]}>
            Amara Eze · Digital Innovation · Term 2
          </Text>
          <Text style={[styles.certTap, { color: colors.brand }]}>
            Tap to view & download →
          </Text>
        </View>
      </Pressable>

      {/* Dark theme toggle */}
      <View
        style={[
          styles.prow,
          { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 14 },
        ]}
      >
        <View style={[styles.pi, { backgroundColor: colors.surface2 }]}>
          <SunDotIcon size={17} color={colors.textMuted} strokeWidth={2} />
        </View>
        <Text style={[styles.pl, { color: colors.text }]}>Dark theme</Text>
        <Pressable
          onPress={toggleTheme}
          style={[
            styles.toggle,
            { backgroundColor: isDark ? colors.brand : colors.surface2 },
          ]}
        >
          <View style={[styles.knob, isDark ? styles.knobOn : styles.knobOff]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  apphead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingTop: 6,
    paddingBottom: 14,
  },
  av: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avText: {
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 17,
    color: '#3b1d05',
  },
  hi: {
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 22,
  },
  sub: {
    fontSize: 12,
  },
  bgrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  bg: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 6,
  },
  disc: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#0f172a',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  bn: {
    fontSize: 10.5,
    fontFamily: fonts.uiBold,
    textAlign: 'center',
    lineHeight: 12,
  },
  certcard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  certInner: {
    borderWidth: 2,
    borderColor: '#e7c98a',
    margin: 10,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  certBrand: {
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 12,
  },
  certTitle: {
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 15,
    marginVertical: 5,
    textAlign: 'center',
  },
  certMeta: {
    fontSize: 12,
    textAlign: 'center',
  },
  certTap: {
    fontSize: 11,
    fontFamily: fonts.uiBold,
    marginTop: 8,
  },
  prow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  pi: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pl: {
    flex: 1,
    fontFamily: fonts.uiBold,
    fontSize: 13.5,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 99,
    position: 'relative',
  },
  knob: {
    position: 'absolute',
    top: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  knobOn: {
    right: 3,
  },
  knobOff: {
    left: 3,
  },
});
