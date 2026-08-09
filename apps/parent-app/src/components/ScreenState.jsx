import React from 'react';
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';

/** Placeholder while a screen's first request is in flight. */
export function Loading({ label = 'Loading…' }) {
  const { colors } = useTheme();
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.brand} />
      <Text style={{ fontSize: 12.5, color: colors.textMuted }}>{label}</Text>
    </View>
  );
}

/** Nothing to show yet — a normal state for a learner who is just starting. */
export function EmptyState({ title, sub, style }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.empty, { borderColor: colors.border }, style]}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      {sub ? <Text style={[styles.emptySub, { color: colors.textMuted }]}>{sub}</Text> : null}
    </View>
  );
}

/**
 * A failed request. `ApiError` messages are already written for a person to
 * read; anything else gets a generic line rather than leaking internals.
 */
export function ErrorState({ error, onRetry }) {
  const { colors } = useTheme();
  const message =
    error?.name === 'ApiError' && error.message
      ? error.message
      : 'Something went wrong loading this screen.';

  return (
    <View style={[styles.error, { borderColor: colors.danger, backgroundColor: colors.surface }]}>
      <Text style={[styles.errorTitle, { color: colors.text }]}>Could not load</Text>
      <Text style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 18 }}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={[styles.retry, { backgroundColor: colors.brandSoft }]}>
          <Text style={{ fontSize: 12.5, fontFamily: fonts.ui700, color: colors.brand }}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** The loading → error → empty → content ladder every list screen walks. */
export function AsyncList({ state, empty, children, loadingLabel }) {
  const { data, error, loading, reload } = state;
  const rows = data ?? [];

  if (loading && !rows.length) return <Loading label={loadingLabel} />;
  if (error && !rows.length) return <ErrorState error={error} onRetry={reload} />;
  if (!rows.length) return <EmptyState title={empty?.title ?? 'Nothing here yet'} sub={empty?.sub} />;
  return <>{children(rows)}</>;
}

const styles = StyleSheet.create({
  loading: { paddingVertical: 34, alignItems: 'center', gap: 11 },
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 13,
  },
  emptyTitle: { fontFamily: fonts.display, fontWeight: '900', fontSize: 14, textAlign: 'center', marginBottom: 5 },
  emptySub: { fontSize: 12.5, textAlign: 'center', lineHeight: 18 },
  error: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 13 },
  errorTitle: { fontFamily: fonts.display, fontWeight: '900', fontSize: 14, marginBottom: 5 },
  retry: { marginTop: 13, alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 15 },
});
