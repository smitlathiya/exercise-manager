import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface Props {
  title: string;
  subtitle?: string;
  rightAction?: { label: string; onPress: () => void };
  onBack?: () => void;
}

export const ScreenHeader: React.FC<Props> = ({ title, subtitle, rightAction, onBack }) => {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: t.spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={{ marginRight: t.spacing.md }}>
            <Text variant="h2" color="primary">
              ‹
            </Text>
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text variant="h1">{title}</Text>
          {subtitle ? (
            <Text variant="caption" color="muted">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {rightAction ? (
        <Pressable onPress={rightAction.onPress} hitSlop={8}>
          <Text variant="bodyBold" color="primary">
            {rightAction.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};
