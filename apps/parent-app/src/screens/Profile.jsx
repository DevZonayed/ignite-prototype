import React, { useRef, useEffect } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '../components/Icon';
import { children } from '../data';
import { useTheme } from '../ThemeContext';

// PROFILE screen — linked children, privacy row, dark-theme toggle.
export default function Profile() {
  const { colors, fonts, mode, toggleTheme } = useTheme();
  const darkOn = mode === 'dark';
  const knobAnim = useRef(new Animated.Value(darkOn ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(knobAnim, {
      toValue: darkOn ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [darkOn]);

  const knobLeft = knobAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 21],
  });

  return (
    <View>
      <Text style={[styles.pagetitle, { color: colors.text, fontFamily: fonts.display }]}>
        Profile
      </Text>
      <Text style={[styles.pagesub, { color: colors.textMuted, fontFamily: fonts.ui }]}>
        Parent account · Mr. Tunde Eze
      </Text>

      <Text style={[styles.section, { color: colors.text, fontFamily: fonts.display800 }]}>
        Linked children
      </Text>

      {children.map((c) => (
        <View
          key={c.av}
          style={[styles.prow, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={[styles.pi, { backgroundColor: c.avc }]}>
            <Text style={[styles.piText, { color: c.avt, fontFamily: fonts.display }]}>
              {c.av}
            </Text>
          </View>
          <Text style={[styles.pl, { color: colors.text, fontFamily: fonts.ui700 }]}>{c.n}</Text>
          <Text style={[styles.verified, { color: colors.success, fontFamily: fonts.ui700 }]}>
            Verified
          </Text>
        </View>
      ))}

      {/* Privacy & data */}
      <View
        style={[
          styles.prow,
          { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 8 },
        ]}
      >
        <View style={[styles.pi, { backgroundColor: colors.surface2 }]}>
          <Icon name="shield" size={17} color={colors.textMuted} strokeWidth={2} />
        </View>
        <Text style={[styles.pl, { color: colors.text, fontFamily: fonts.ui700 }]}>
          Privacy & data
        </Text>
        <Icon name="chevronRight" size={16} color={colors.textSubtle} strokeWidth={2} />
      </View>

      {/* Dark theme toggle */}
      <View style={[styles.prow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.pi, { backgroundColor: colors.surface2 }]}>
          <Icon name="gear" size={17} color={colors.textMuted} strokeWidth={2} />
        </View>
        <Text style={[styles.pl, { color: colors.text, fontFamily: fonts.ui700 }]}>
          Dark theme
        </Text>
        <Pressable
          onPress={toggleTheme}
          style={[
            styles.toggle,
            { backgroundColor: darkOn ? colors.brand : colors.surface2 },
          ]}
        >
          <Animated.View style={[styles.knob, { left: knobLeft }]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pagetitle: { fontSize: 22, fontWeight: '900', paddingVertical: 2 },
  pagesub: { fontSize: 12.5, marginBottom: 4 },
  section: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 10,
    marginHorizontal: 2,
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
  piText: { fontSize: 13, fontWeight: '900' },
  pl: { flex: 1, fontSize: 13.5, fontWeight: '700' },
  verified: { fontSize: 11, fontWeight: '700' },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 99,
    justifyContent: 'center',
  },
  knob: {
    position: 'absolute',
    top: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
});
