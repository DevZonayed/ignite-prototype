import React, { useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { SubHead, Button, SectionTitle, GradientBox, withAlpha, Hint } from '../components/ui';
import { Loading, ErrorState } from '../components/ScreenState';
import { IconShield, IconCamera, IconCheck } from '../components/Icon';
import { useClasses } from '../context/ClassContext';
import { useApi, useAction } from '../api/useApi';
import { listLearners, createEvidence, getCurrentSession } from '../api/endpoints';
import { displayName, initialsOf } from '../lib/user';

export default function EvidenceScreen({ goBack, showToast, params }) {
  const { colors } = useTheme();
  const { activeClassId } = useClasses();

  const session = useApi(() => getCurrentSession(activeClassId), [activeClassId], {
    skip: !activeClassId || !!params?.lessonId,
  });
  const lessonId = params?.lessonId ?? session.data?.lessonId ?? null;

  const roster = useApi(() => listLearners(activeClassId), [activeClassId], {
    skip: !activeClassId,
    initial: [],
  });

  const [asset, setAsset] = useState(null);
  const [tagged, setTagged] = useState({});
  const [consent, setConsent] = useState(false);
  const [pickError, setPickError] = useState(null);

  const learners = roster.data ?? [];
  const taggedIds = Object.keys(tagged).filter((id) => tagged[id]);

  async function capture(fromLibrary) {
    setPickError(null);
    try {
      const perm = fromLibrary
        ? await ImagePicker.requestMediaLibraryPermissionsAsync()
        : await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setPickError(
          new Error(
            fromLibrary
              ? 'Photo access is off for IGNITE. Turn it on in Settings to choose a photo.'
              : 'Camera access is off for IGNITE. Turn it on in Settings to take a photo.',
          ),
        );
        return;
      }
      const result = fromLibrary
        ? await ImagePicker.launchImageLibraryAsync({ quality: 0.7 })
        : await ImagePicker.launchCameraAsync({ quality: 0.7 });
      if (!result.canceled && result.assets?.length) setAsset(result.assets[0]);
    } catch (err) {
      setPickError(err);
    }
  }

  const save = useAction(() =>
    createEvidence({
      lessonId,
      classId: activeClassId,
      mediaType: 'photo',
      // The server stores a reference, not the bytes — it has no file storage
      // yet (the media module keeps records in memory and drops the upload). So
      // this URI is meaningful on this device only, until object storage exists.
      fileUrl: asset.uri,
      consentChecked: consent,
      ...(taggedIds.length ? { learnerIds: taggedIds } : {}),
    }),
  );

  async function onUpload() {
    try {
      await save.run();
      showToast('Evidence recorded');
      setTimeout(goBack, 240);
    } catch {
      // Rendered inline.
    }
  }

  const canSave = !!asset && consent && !!lessonId && !!activeClassId;

  return (
    <View>
      <SubHead title="Add evidence" onBack={goBack} />

      {asset ? (
        <Image
          source={{ uri: asset.uri }}
          style={{ width: '100%', height: 200, borderRadius: 14, marginBottom: 13, backgroundColor: colors.surface2 }}
          resizeMode="cover"
        />
      ) : (
        <GradientBox colors={['#1e293b', '#0f172a']} idSuffix="ev" radius={14} style={{ height: 170, alignItems: 'center', justifyContent: 'center', marginBottom: 13 }}>
          <IconCamera size={30} color="#94a3b8" />
          <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>No evidence captured yet</Text>
        </GradientBox>
      )}

      {pickError ? <ErrorState error={pickError} /> : null}

      <View style={{ flexDirection: 'row', gap: 9, marginBottom: 14 }}>
        <View style={{ flex: 1 }}>
          <Button variant="ghost" onPress={() => capture(false)}>
            📷 Take photo
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button variant="ghost" onPress={() => capture(true)}>
            🖼 Choose
          </Button>
        </View>
      </View>

      <SectionTitle>Tag learners</SectionTitle>
      {roster.loading ? <Loading label="Loading roster…" /> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 13 }}>
        {learners.length === 0 && !roster.loading ? (
          <Text style={{ fontSize: 12.5, color: colors.textSubtle }}>
            Learners from your roster will appear here.
          </Text>
        ) : null}
        {learners.map((l) => {
          const on = !!tagged[l.id];
          return (
            <Pressable
              key={l.id}
              onPress={() => setTagged((prev) => ({ ...prev, [l.id]: !prev[l.id] }))}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderWidth: 1.5,
                borderColor: on ? colors.brand : colors.border,
                backgroundColor: on ? colors.brandSoft : 'transparent',
                borderRadius: 999,
                paddingVertical: 6,
                paddingHorizontal: 10,
              }}
            >
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: l.avatarBg || colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 9, fontFamily: fonts.body700, fontWeight: '700', color: l.avatarColor || colors.text }}>
                  {initialsOf(l)}
                </Text>
              </View>
              <Text style={{ fontSize: 12, fontFamily: fonts.body700, fontWeight: '700', color: on ? colors.brand : colors.textMuted }}>
                {displayName(l)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => setConsent((v) => !v)}
        style={{ flexDirection: 'row', gap: 9, alignItems: 'center', backgroundColor: withAlpha(colors.warning, 0.1), borderWidth: 1, borderColor: withAlpha(colors.warning, 0.34), borderRadius: 12, padding: 11, marginBottom: 12 }}
      >
        <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: colors.warning, backgroundColor: consent ? colors.warning : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          {consent ? <IconCheck size={12} color="#fff" strokeWidth={3} /> : null}
        </View>
        <IconShield size={16} color={colors.warning} />
        <Text style={{ fontSize: 12, color: colors.warning, fontFamily: fonts.body600, fontWeight: '600', flex: 1 }}>
          Consent-checked · faces protected
        </Text>
      </Pressable>

      {save.error ? <ErrorState error={save.error} /> : null}

      <Button variant="primary" disabled={!canSave || save.pending} onPress={onUpload}>
        {save.pending ? 'Saving…' : 'Upload'}
      </Button>
      {asset && !consent ? <Hint>Confirm consent before recording evidence.</Hint> : null}
    </View>
  );
}
