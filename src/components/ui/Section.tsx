import React from 'react';
import { View, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface Props {
  title?: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
  style?: ViewStyle;
  children: React.ReactNode;
}

export const Section: React.FC<Props> = ({ title, subtitle, action, style, children }) => {
  const t = useTheme();
  return (
    <View style={[{ marginBottom: t.spacing.xxl }, style]}>
      {title || action ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: t.spacing.md,
          }}
        >
          <View style={{ flex: 1 }}>
            {title ? <Text variant="h2">{title}</Text> : null}
            {subtitle ? (
              <Text variant="caption" color="muted" style={{ marginTop: 2 }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {action ? (
            <Pressable hitSlop={8} onPress={action.onPress}>
              <Text variant="label" color="primary">
                {action.label}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
};
