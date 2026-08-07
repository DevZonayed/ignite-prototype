import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';

export default function ConfirmModal({ visible, onCancel, onConfirm }) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: 'rgba(15,23,42,.55)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onCancel} />
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            paddingHorizontal: 20,
            paddingTop: 22,
            paddingBottom: 30,
          }}
        >
          <Text style={{ fontFamily: fonts.display, fontWeight: '900', fontSize: 18, color: colors.text, marginBottom: 8 }}>
            Remove failed item?
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 18, lineHeight: 20 }}>
            This unsynced work will be permanently lost and cannot be recovered.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={onCancel}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface }}
            >
              <Text style={{ fontFamily: fonts.display800, fontWeight: '800', fontSize: 14, color: colors.brand }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: colors.danger, backgroundColor: colors.danger }}
            >
              <Text style={{ fontFamily: fonts.display800, fontWeight: '800', fontSize: 14, color: '#fff' }}>Remove</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
