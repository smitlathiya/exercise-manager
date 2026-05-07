import React, { useCallback, useState } from 'react';
import { View, Image, Pressable, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Screen, ScreenHeader, Card, Text, Pill, EmptyState } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { listProgressPhotos } from '@/database/repositories/photos';
import type { ProgressPhoto } from '@/types';
import { formatDate } from '@/utils/date';

type Cat = 'front' | 'side' | 'back';

export const PhotoCompareScreen: React.FC = () => {
  const t = useTheme();
  const nav = useNavigation();
  const [cat, setCat] = useState<Cat>('front');
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [leftId, setLeftId] = useState<string | null>(null);
  const [rightId, setRightId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const list = await listProgressPhotos(cat);
    setPhotos(list);
    if (list.length >= 2) {
      setLeftId(list[list.length - 1]!.id);
      setRightId(list[0]!.id);
    } else {
      setLeftId(null);
      setRightId(null);
    }
  }, [cat]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const left = photos.find((p) => p.id === leftId);
  const right = photos.find((p) => p.id === rightId);

  return (
    <Screen scroll>
      <ScreenHeader title="Compare" onBack={() => nav.goBack()} />
      <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginBottom: t.spacing.md }}>
        {(['front', 'side', 'back'] as const).map((c) => (
          <Pill key={c} label={c[0]!.toUpperCase() + c.slice(1)} active={cat === c} onPress={() => setCat(c)} />
        ))}
      </View>

      {photos.length < 2 ? (
        <EmptyState
          title="Need at least 2 photos"
          description={`You have ${photos.length} ${cat} photos.`}
        />
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
            <SidePane label="Before" photo={left} />
            <SidePane label="After" photo={right} />
          </View>

          <Text variant="h3" style={{ marginTop: t.spacing.lg, marginBottom: t.spacing.sm }}>Pick photos</Text>
          {(['Before', 'After'] as const).map((side) => (
            <Card key={side} style={{ marginBottom: t.spacing.sm }}>
              <Text variant="caption" color="muted" style={{ marginBottom: t.spacing.sm }}>
                {side.toUpperCase()}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
                  {photos.map((p) => {
                    const selected = side === 'Before' ? leftId === p.id : rightId === p.id;
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() =>
                          side === 'Before' ? setLeftId(p.id) : setRightId(p.id)
                        }
                        style={{
                          borderWidth: 2,
                          borderColor: selected ? t.colors.primary : 'transparent',
                          borderRadius: 8,
                          padding: 2,
                        }}
                      >
                        <Image
                          source={{ uri: p.thumb_uri ?? p.local_uri }}
                          style={{ width: 80, height: 80, borderRadius: 6 }}
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
};

const SidePane: React.FC<{ label: string; photo: ProgressPhoto | undefined }> = ({
  label,
  photo,
}) => {
  const t = useTheme();
  return (
    <Card padded={false} style={{ flex: 1, overflow: 'hidden' }}>
      {photo ? (
        <>
          <Image
            source={{ uri: photo.local_uri }}
            style={{ width: '100%', aspectRatio: 0.75 }}
          />
          <View style={{ padding: t.spacing.sm }}>
            <Text variant="caption" color="muted">
              {label.toUpperCase()}
            </Text>
            <Text variant="bodyBold">{formatDate(photo.taken_at, 'MMM D, YYYY')}</Text>
          </View>
        </>
      ) : null}
    </Card>
  );
};
