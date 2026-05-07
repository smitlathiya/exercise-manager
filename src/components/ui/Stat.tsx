import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';
import { Card } from './Card';

interface Props {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  style?: ViewStyle;
}

export const Stat: React.FC<Props> = ({ label, value, hint, tone = 'default', style }) => {
  const t = useTheme();
  const valueColor = {
    default: t.colors.text,
    primary: t.colors.primary,
    success: t.colors.success,
    warning: t.colors.warning,
    danger: t.colors.danger,
  }[tone];
  return (
    <Card style={{ flex: 1, ...style }}>
      <Text variant="caption" color="muted">
        {label.toUpperCase()}
      </Text>
      <Text variant="h2" style={{ color: valueColor, marginTop: t.spacing.xs }}>
        {value}
      </Text>
      {hint ? (
        <Text variant="caption" color="dim" style={{ marginTop: t.spacing.xxs }}>
          {hint}
        </Text>
      ) : null}
    </Card>
  );
};

export const StatRow: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap }) => {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: gap ?? t.spacing.md }}>{children}</View>
  );
};
