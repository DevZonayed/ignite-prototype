import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, AccessibilityInfo } from 'react-native';
import { useTheme } from '../ThemeContext';

/**
 * Skeleton placeholders.
 *
 * Loading states hold the shape of the content that is coming rather than
 * spinning in the middle of an empty screen: the layout is already reserved, so
 * nothing jumps when the data lands, and the wait reads as "nearly there"
 * instead of "something is happening somewhere".
 *
 * The shimmer is an opacity loop on the native driver — a moving gradient would
 * need a masked view per bar, which is a lot of layers for a phone list. Under
 * "reduce motion" the bars sit still at their mid opacity.
 */

const MIN_OPACITY = 0.45;
const MAX_OPACITY = 1;

/** Shared pulse so every bar on screen breathes together rather than at random. */
function usePulse() {
  const value = useRef(new Animated.Value(MAX_OPACITY)).current;
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loop;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((isReduced) => {
        if (cancelled) return;
        if (isReduced) {
          setReduced(true);
          value.setValue((MIN_OPACITY + MAX_OPACITY) / 2);
          return;
        }
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: MIN_OPACITY,
              duration: 620,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: MAX_OPACITY,
              duration: 620,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        );
        loop.start();
      })
      .catch(() => value.setValue((MIN_OPACITY + MAX_OPACITY) / 2));

    return () => {
      cancelled = true;
      if (loop) loop.stop();
    };
  }, [value]);

  return reduced ? undefined : value;
}

/** One bar. `w` accepts a number or a percentage string. */
export function Skel({ w = '100%', h = 12, r = 7, style }) {
  const { colors } = useTheme();
  const opacity = usePulse();
  return (
    <Animated.View
      style={[
        { width: w, height: h, borderRadius: r, backgroundColor: colors.surface2, opacity },
        style,
      ]}
    />
  );
}

/** A paragraph of bars; the last is short so it reads as text. */
export function SkelText({ lines = 3, widths, gap = 9 }) {
  const fallback = ['92%', '78%', '54%', '84%', '61%'];
  return (
    <View style={{ gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skel key={i} w={widths?.[i] ?? fallback[i % fallback.length]} h={11} />
      ))}
    </View>
  );
}

/** Card-shaped rows: the shape most list screens land in. */
export function SkelCards({ count = 3, avatar = true, lines = 2 }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 11 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 13,
            padding: 15,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          {avatar ? <Skel w={40} h={40} r={12} /> : null}
          <View style={{ flex: 1, gap: 8 }}>
            <Skel w={i % 2 ? '58%' : '72%'} h={13} />
            {lines > 1 ? <Skel w={i % 2 ? '36%' : '45%'} h={10} /> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

/** Label + track + value rows, for skills and coverage lists. */
export function SkelBars({ rows = 4 }) {
  return (
    <View style={{ gap: 15 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
          <Skel w={78} h={11} />
          <Skel w="100%" h={9} r={99} style={{ flex: 1 }} />
          <Skel w={30} h={11} />
        </View>
      ))}
    </View>
  );
}

/**
 * A stat strip — the tiles that head a dashboard.
 *
 * Unframed by default: most stat strips already sit inside a card, and drawing
 * a second border there gives the placeholder a box the real content does not
 * have. `framed` is for the standalone case.
 */
export function SkelTiles({ count = 3, framed = false }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        { flexDirection: 'row', gap: 11 },
        framed
          ? {
              padding: 15,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }
          : { paddingVertical: 6 },
      ]}
    >
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', gap: 9 }}>
          <Skel w={34} h={34} r={11} />
          <Skel w="70%" h={14} />
          <Skel w="90%" h={9} />
        </View>
      ))}
    </View>
  );
}

/** Label + input pairs, for forms. */
export function SkelForm({ fields = 3 }) {
  return (
    <View style={{ gap: 16 }}>
      {Array.from({ length: fields }).map((_, i) => (
        <View key={i} style={{ gap: 8 }}>
          <Skel w={92} h={9} />
          <Skel w="100%" h={46} r={14} />
        </View>
      ))}
    </View>
  );
}

/** Whole-screen placeholder: a stat strip over a few cards. */
export function SkelScreen() {
  return (
    <View style={{ gap: 16 }}>
      <SkelTiles framed />
      <SkelCards count={3} />
    </View>
  );
}
