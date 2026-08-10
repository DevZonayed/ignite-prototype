import React from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { EmptyState } from './ui';

/** Placeholder while a screen's first request is in flight. */
export function Loading({ label = 'Loading…' }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingVertical: 34, alignItems: 'center', gap: 11 }}>
      <ActivityIndicator color={colors.brand} />
      <Text style={{ fontSize: 12.5, color: colors.textMuted }}>{label}</Text>
    </View>
  );
}

/**
 * A failed request, with the reason and a way out. `ApiError` messages are
 * already written for a person to read, so they are shown as-is; anything else
 * gets a generic line rather than leaking a stack trace onto a phone screen.
 */
export function ErrorState({ error, onRetry }) {
  const { colors } = useTheme();
  const message =
    error?.name === 'ApiError' && error.message
      ? error.message
      : 'Something went wrong loading this screen.';

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.danger,
        borderRadius: 14,
        padding: 16,
        marginBottom: 13,
        backgroundColor: colors.surface,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.display800,
          fontWeight: '800',
          fontSize: 14,
          color: colors.text,
          marginBottom: 5,
        }}
      >
        Could not load
      </Text>
      <Text style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 18 }}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={{
            marginTop: 13,
            alignSelf: 'flex-start',
            borderRadius: 999,
            paddingVertical: 7,
            paddingHorizontal: 15,
            backgroundColor: colors.brandSoft,
          }}
        >
          <Text
            style={{
              fontSize: 12.5,
              fontFamily: fonts.body700,
              fontWeight: '700',
              color: colors.brand,
            }}
          >
            Try again
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * The loading → error → empty → content ladder every list screen walks, in one
 * place so all of them behave the same way.
 *
 *   <AsyncList state={state} empty={{ title: 'No learners yet' }}>
 *     {(rows) => rows.map(...)}
 *   </AsyncList>
 */
export function AsyncList({ state, empty, children, loadingLabel }) {
  const { data, error, loading, reload } = state;
  const rows = data ?? [];

  if (loading && !rows.length) return <Loading label={loadingLabel} />;
  if (error && !rows.length) return <ErrorState error={error} onRetry={reload} />;
  if (!rows.length) return <EmptyState title={empty?.title ?? 'Nothing here yet'} sub={empty?.sub} />;
  return <>{children(rows)}</>;
}
