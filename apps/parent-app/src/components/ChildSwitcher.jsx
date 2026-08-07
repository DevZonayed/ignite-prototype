import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';
import { children } from '../data';
import { useTheme } from '../ThemeContext';

// Pill button + dropdown menu — matches .switcher/.swbtn/.swmenu in parent.html.
export default function ChildSwitcher({ current, onSelect }) {
  const { colors, fonts } = useTheme();
  const [open, setOpen] = useState(false);
  const c = children[current];

  return (
    <View style={styles.switcher}>
      <Pressable
        style={[
          styles.swbtn,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={() => setOpen((o) => !o)}
      >
        <View style={[styles.av, { backgroundColor: c.avc }]}>
          <Text style={[styles.avText, { color: c.avt, fontFamily: fonts.display }]}>
            {c.av}
          </Text>
        </View>
        <Text style={[styles.nm, { color: colors.text, fontFamily: fonts.display800 }]}>
          {c.n}
        </Text>
        <View style={{ marginLeft: 6 }}>
          <Icon name="chevronDown" size={16} color={colors.textMuted} strokeWidth={2} />
        </View>
      </Pressable>

      {open && (
        <>
          <Pressable
            style={styles.backdrop}
            onPress={() => setOpen(false)}
          />
          <View
            style={[
              styles.swmenu,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {children.map((ch, i) => (
              <Pressable
                key={ch.av}
                style={styles.switem}
                onPress={() => {
                  onSelect(i);
                  setOpen(false);
                }}
              >
                <View style={[styles.itemAv, { backgroundColor: ch.avc }]}>
                  <Text
                    style={[styles.itemAvText, { color: ch.avt, fontFamily: fonts.display }]}
                  >
                    {ch.av}
                  </Text>
                </View>
                <Text
                  style={[styles.switemText, { color: colors.text, fontFamily: fonts.ui700 }]}
                >
                  {ch.n}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  switcher: {
    marginTop: 4,
    marginBottom: 14,
    position: 'relative',
    zIndex: 20,
  },
  swbtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 7,
    paddingRight: 14,
    paddingLeft: 7,
    alignSelf: 'flex-start',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  av: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avText: { fontSize: 13, fontWeight: '900' },
  nm: { fontSize: 15, fontWeight: '800' },
  backdrop: {
    position: 'absolute',
    top: -500,
    left: -500,
    right: -500,
    bottom: -500,
    zIndex: 25,
  },
  swmenu: {
    position: 'absolute',
    top: 52,
    left: 0,
    borderWidth: 1,
    borderRadius: 14,
    padding: 6,
    minWidth: 210,
    zIndex: 30,
    shadowColor: '#0f172a',
    shadowOpacity: 0.16,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  switem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  itemAv: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemAvText: { fontSize: 12, fontWeight: '900' },
  switemText: { fontSize: 13.5, fontWeight: '700' },
});
