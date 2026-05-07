import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}

export const Switch: React.FC<Props> = ({ value, onValueChange, disabled }) => {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      style={{
        width: 46,
        height: 26,
        borderRadius: 13,
        padding: 2,
        backgroundColor: value ? t.colors.primary : t.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: t.colors.border,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          alignSelf: value ? 'flex-end' : 'flex-start',
        }}
      />
    </Pressable>
  );
};
