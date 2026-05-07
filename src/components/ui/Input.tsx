import React from 'react';
import { TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  hint?: string;
}

export const Input = React.forwardRef<TextInput, Props>(
  ({ label, error, hint, containerStyle, style, ...rest }, ref) => {
    const t = useTheme();
    return (
      <View style={[{ marginBottom: t.spacing.md }, containerStyle]}>
        {label ? (
          <Text variant="caption" color="muted" style={{ marginBottom: t.spacing.xs }}>
            {label.toUpperCase()}
          </Text>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={t.colors.textDim}
          style={[
            {
              backgroundColor: t.colors.surface,
              borderRadius: t.radius.md,
              borderWidth: 1,
              borderColor: error ? t.colors.danger : t.colors.border,
              color: t.colors.text,
              paddingHorizontal: t.spacing.lg,
              paddingVertical: t.spacing.md,
              fontSize: 15,
            },
            style,
          ]}
          {...rest}
        />
        {error ? (
          <Text variant="caption" color="danger" style={{ marginTop: t.spacing.xs }}>
            {error}
          </Text>
        ) : hint ? (
          <Text variant="caption" color="dim" style={{ marginTop: t.spacing.xs }}>
            {hint}
          </Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';
