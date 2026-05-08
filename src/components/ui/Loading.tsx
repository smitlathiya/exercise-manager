import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface Props {
  message?: string;
  inline?: boolean;
}

export const Loading: React.FC<Props> = ({ message, inline }) => {
  const t = useTheme();
  return (
    <View
      style={{
        flex: inline ? undefined : 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: inline ? t.spacing.lg : 0,
        backgroundColor: inline ? undefined : t.colors.bg,
        gap: t.spacing.md,
      }}
    >
      <ActivityIndicator color={t.colors.primary} size={inline ? 'small' : 'large'} />
      {message ? (
        <Text color="muted" variant="caption">
          {message}
        </Text>
      ) : null}
    </View>
  );
};
