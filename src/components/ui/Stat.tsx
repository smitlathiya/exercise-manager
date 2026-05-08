import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';
import { Card } from './Card';
import { Skeleton } from './Skeleton';

type Tone = 'default' | 'primary' | 'success' | 'warning' | 'danger';

interface Props {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
  loading?: boolean;
  style?: ViewStyle;
}

export const Stat: React.FC<Props> = ({ label, value, hint, tone = 'default', loading, style }) => {
  const t = useTheme();
  const valueColor = {
    default: t.colors.text,
    primary: t.colors.primary,
    success: t.colors.success,
    warning: t.colors.warning,
    danger: t.colors.danger,
  }[tone];

  return (
    <Card style={{ flex: 1, ...style }} variant="flat">
      <Text variant="caption" color="muted">
        {label}
      </Text>
      {loading ? (
        <Skeleton height={22} width={64} style={{ marginTop: t.spacing.xs }} />
      ) : (
        <Text variant="h2" style={{ color: valueColor, marginTop: t.spacing.xs }}>
          {value}
        </Text>
      )}
      {hint ? (
        <Text variant="footnote" color="dim" style={{ marginTop: 2 }}>
          {hint}
        </Text>
      ) : null}
    </Card>
  );
};

export const StatRow: React.FC<{ children: React.ReactNode; gap?: number }> = ({
  children,
  gap,
}) => {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: gap ?? t.spacing.md }}>{children}</View>
  );
};
