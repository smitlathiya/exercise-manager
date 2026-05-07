import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface Props {
  label?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
}

export const Fab: React.FC<Props> = ({ label, icon, onPress, style }) => {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          position: 'absolute',
          right: t.spacing.lg,
          bottom: t.spacing.xl,
          backgroundColor: t.colors.primary,
          paddingHorizontal: label ? t.spacing.lg : 0,
          height: 56,
          minWidth: 56,
          borderRadius: 28,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon ? icon : null}
      {label ? (
        <Text variant="bodyBold" style={{ color: '#FFF', marginLeft: icon ? 6 : 0 }}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
};
