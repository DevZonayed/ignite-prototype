import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { AppHead } from '../components/ui';
import { IconSync, IconBellSimple, IconThemeRow, IconSignOut } from '../components/Icon';

function PRow({ icon, label, right, onPress, labelColor }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, marginBottom: 10 }}
    >
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <Text style={{ flex: 1, fontFamily: fonts.body700, fontWeight: '700', fontSize: 13.5, color: labelColor || colors.text }}>{label}</Text>
      {right}
    </Pressable>
  );
}

export default function ProfileScreen({ navTo, showToast, user, onSignOut }) {
  const { colors, mode, toggle } = useTheme();
  const dark = mode === 'dark';

  return (
    <View>
      <AppHead
        name={(user && user.name) || ''}
        role={(user && user.role) || ''}
      />

      <PRow
        icon={<IconSync size={17} color={colors.textMuted} />}
        label="Sync queue"
        onPress={() => navTo('sync')}
      />
      <PRow icon={<IconBellSimple size={17} color={colors.textMuted} />} label="Notifications" onPress={() => navTo('notifications')} />

      {/* Dark theme toggle row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, marginBottom: 10 }}>
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
          <IconThemeRow size={17} color={colors.textMuted} />
        </View>
        <Text style={{ flex: 1, fontFamily: fonts.body700, fontWeight: '700', fontSize: 13.5, color: colors.text }}>Dark theme</Text>
        <Pressable onPress={toggle} style={{ width: 44, height: 26, borderRadius: 99, backgroundColor: dark ? colors.brand : colors.surface2, justifyContent: 'center' }}>
          <View style={{ position: 'absolute', top: 3, width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', right: dark ? 3 : 21 }} />
        </Pressable>
      </View>

      <PRow
        icon={<IconSignOut size={17} color={colors.danger} />}
        label="Sign out"
        labelColor={colors.danger}
        onPress={onSignOut}
      />
    </View>
  );
}
