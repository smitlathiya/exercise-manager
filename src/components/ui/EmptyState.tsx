import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';
import { Button } from './Button';

interface Props {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<Props> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  const t = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: t.spacing.xl,
        gap: t.spacing.sm,
      }}
    >
      {icon ? <View style={{ marginBottom: t.spacing.md }}>{icon}</View> : null}
      <Text variant="h3" align="center">
        {title}
      </Text>
      {description ? (
        <Text variant="body" color="muted" align="center">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant="primary" style={{ marginTop: t.spacing.md }} />
      ) : null}
    </View>
  );
};
