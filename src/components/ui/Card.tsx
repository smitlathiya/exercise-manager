import React from 'react';
import { View, ViewStyle, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'flat' | 'elevated';
  padded?: boolean;
}

export const Card: React.FC<Props> = ({
  children,
  style,
  onPress,
  variant = 'flat',
  padded = true,
}) => {
  const t = useTheme();
  const base: ViewStyle = {
    backgroundColor: variant === 'elevated' ? t.colors.bgElevated : t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: variant === 'elevated' ? 0 : 1,
    borderColor: t.colors.border,
    padding: padded ? t.spacing.lg : 0,
  };
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [base, { opacity: pressed ? 0.8 : 1 }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
};

export const CardRow: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => (
  <View
    style={[
      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
      style,
    ]}
  >
    {children}
  </View>
);

export const Divider: React.FC<{ vertical?: boolean }> = ({ vertical }) => {
  const t = useTheme();
  return (
    <View
      style={
        vertical
          ? { width: 1, alignSelf: 'stretch', backgroundColor: t.colors.border }
          : { height: 1, alignSelf: 'stretch', backgroundColor: t.colors.border }
      }
    />
  );
};

const _styles = StyleSheet.create({});
