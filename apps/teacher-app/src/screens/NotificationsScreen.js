import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Button } from '../components/ui';
import { AsyncList } from '../components/ScreenState';
import { useApi, useAction } from '../api/useApi';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/endpoints';

// The server stores a free-text `type`; these cover what it currently emits and
// anything new falls back to a neutral bell.
const ICONS = {
  homework: '📚',
  badge: '🏅',
  curriculum: '📘',
  announcement: '📣',
  attendance: '🗓',
  report: '📊',
};

function timeAgo(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsScreen({ goBack }) {
  const { colors } = useTheme();

  const state = useApi(() => listNotifications(), [], { initial: [] });

  const readOne = useAction(async (id) => {
    await markNotificationRead(id);
    await state.reload();
  });
  const readAll = useAction(async () => {
    await markAllNotificationsRead();
    await state.reload();
  });

  const unread = (state.data ?? []).filter((n) => !n.read).length;

  return (
    <View>
      <SubHead title="Notifications" onBack={goBack} />

      {unread > 0 ? (
        <Button variant="ghost" disabled={readAll.pending} onPress={() => readAll.run()} style={{ marginBottom: 12 }}>
          {readAll.pending ? 'Marking…' : `Mark all read (${unread})`}
        </Button>
      ) : null}

      <AsyncList
        state={state}
        loadingLabel="Loading notifications…"
        empty={{
          title: 'No notifications',
          sub: 'Updates about homework, badges and curriculum will appear here.',
        }}
      >
        {(items) =>
          items.map((n) => (
            <Pressable
              key={n.id}
              disabled={n.read || readOne.pending}
              onPress={() => readOne.run(n.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 11,
                backgroundColor: n.read ? colors.surface : colors.brandSoft,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18 }}>{ICONS[n.type] ?? '🔔'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.body700, fontWeight: '700', fontSize: 13, color: colors.text }}>
                  {n.title || 'Update'}
                </Text>
                <Text style={{ fontSize: 11.5, color: colors.textSubtle }}>
                  {[n.body, timeAgo(n.createdAt)].filter(Boolean).join(' · ')}
                </Text>
              </View>
            </Pressable>
          ))
        }
      </AsyncList>
    </View>
  );
}
