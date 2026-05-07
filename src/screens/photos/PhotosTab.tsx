import React, { useCallback, useState } from 'react';
import { View, Image, Pressable, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Card, Text, Button, Pill, EmptyState } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { processProgressImage, removeImageFiles } from '@/services/images';
import {
  createProgressPhoto,
  listProgressPhotos,
  deletePhoto,
} from '@/database/repositories/photos';
import type { ProgressPhoto } from '@/types';
import { formatDate } from '@/utils/date';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

type Cat = 'all' | 'front' | 'side' | 'back';

export const PhotosTab: React.FC = () => {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cat, setCat] = useState<Cat>('all');
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);

  const load = useCallback(async () => {
    setPhotos(await listProgressPhotos(cat === 'all' ? undefined : cat));
  }, [cat]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const pickAndSave = async (
    source: 'camera' | 'library',
    category: 'front' | 'side' | 'back'
  ) => {
    const perm =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission denied');
      return;
    }
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 1 })
        : await ImagePicker.launchImageLibraryAsync({
            quality: 1,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const processed = await processProgressImage(asset.uri);
    await createProgressPhoto({
      taken_at: Date.now(),
      category,
      local_uri: processed.uri,
      thumb_uri: processed.thumbUri,
      drive_file_id: null,
      width: processed.width,
      height: processed.height,
    });
    await load();
  };

  const promptUpload = () => {
    Alert.alert('Add photo', 'Choose source', [
      {
        text: 'Camera (Front)',
        onPress: () => pickAndSave('camera', 'front'),
      },
      {
        text: 'Camera (Side)',
        onPress: () => pickAndSave('camera', 'side'),
      },
      {
        text: 'Camera (Back)',
        onPress: () => pickAndSave('camera', 'back'),
      },
      {
        text: 'From gallery (Front)',
        onPress: () => pickAndSave('library', 'front'),
      },
      {
        text: 'From gallery (Side)',
        onPress: () => pickAndSave('library', 'side'),
      },
      {
        text: 'From gallery (Back)',
        onPress: () => pickAndSave('library', 'back'),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginBottom: t.spacing.md }}>
        {(['all', 'front', 'side', 'back'] as const).map((c) => (
          <Pill key={c} label={c[0]!.toUpperCase() + c.slice(1)} active={cat === c} onPress={() => setCat(c)} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginBottom: t.spacing.md }}>
        <Button title="+ Add photo" onPress={promptUpload} style={{ flex: 1 }} />
        <Button title="Compare" variant="secondary" onPress={() => nav.navigate('PhotoCompare')} style={{ flex: 1 }} />
      </View>

      {photos.length === 0 ? (
        <EmptyState title="No photos" description="Capture progress over time." />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
          {photos.map((p) => (
            <Pressable
              key={p.id}
              style={{ width: '48%' }}
              onLongPress={async () => {
                Alert.alert('Delete photo?', undefined, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      await removeImageFiles([p.local_uri, p.thumb_uri]);
                      await deletePhoto(p.id);
                      await load();
                    },
                  },
                ]);
              }}
            >
              <Card padded={false} style={{ overflow: 'hidden' }}>
                <Image
                  source={{ uri: p.thumb_uri ?? p.local_uri }}
                  style={{ width: '100%', aspectRatio: 1 }}
                />
                <View style={{ padding: t.spacing.sm }}>
                  <Text variant="caption" color="muted">
                    {p.category} · {formatDate(p.taken_at, 'MMM D')}
                  </Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};
