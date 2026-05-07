import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

export const Loading: React.FC<{ message?: string }> = ({ message }) => {
  const t = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: t.colors.bg,
        gap: t.spacing.md,
      }}
    >
      <ActivityIndicator color={t.colors.primary} size="large" />
      {message ? (
        <Text color="muted" variant="caption">
          {message}
        </Text>
      ) : null}
    </View>
  );
};
