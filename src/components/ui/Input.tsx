import React, { useState } from 'react';
import { TextInput, TextInputProps, View, ViewStyle, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  iconLeft?: IconName;
  iconRight?: IconName;
  onIconRightPress?: () => void;
  isPassword?: boolean;
}

export const Input = React.forwardRef<TextInput, Props>(
  (
    {
      label,
      error,
      hint,
      containerStyle,
      style,
      iconLeft,
      iconRight,
      onIconRightPress,
      isPassword,
      onFocus,
      onBlur,
      secureTextEntry,
      ...rest
    },
    ref
  ) => {
    const t = useTheme();
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(!!isPassword);

    const borderColor = error
      ? t.colors.danger
      : focused
        ? t.colors.primary
        : t.colors.border;

    const trailingIcon: IconName | undefined = isPassword
      ? hidden
        ? 'eye-outline'
        : 'eye-off-outline'
      : iconRight;

    const onTrailingPress = () => {
      if (isPassword) setHidden((h) => !h);
      else onIconRightPress?.();
    };

    return (
      <View style={[{ marginBottom: t.spacing.md }, containerStyle]}>
        {label ? (
          <Text variant="label" color="muted" style={{ marginBottom: 6 }}>
            {label}
          </Text>
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: t.colors.surface,
            borderRadius: t.radius.md,
            borderWidth: 1,
            borderColor,
            paddingHorizontal: t.spacing.lg,
            minHeight: 48,
          }}
        >
          {iconLeft ? (
            <MaterialCommunityIcons
              name={iconLeft}
              size={18}
              color={focused ? t.colors.primary : t.colors.textDim}
              style={{ marginRight: t.spacing.sm }}
            />
          ) : null}
          <TextInput
            ref={ref}
            placeholderTextColor={t.colors.textDim}
            secureTextEntry={isPassword ? hidden : secureTextEntry}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={[
              {
                flex: 1,
                color: t.colors.text,
                paddingVertical: t.spacing.md,
                fontSize: 15,
              },
              style,
            ]}
            {...rest}
          />
          {trailingIcon ? (
            <Pressable hitSlop={8} onPress={onTrailingPress}>
              <MaterialCommunityIcons
                name={trailingIcon}
                size={18}
                color={t.colors.textDim}
                style={{ marginLeft: t.spacing.sm }}
              />
            </Pressable>
          ) : null}
        </View>
        {error ? (
          <Text variant="caption" color="danger" style={{ marginTop: 6 }}>
            {error}
          </Text>
        ) : hint ? (
          <Text variant="caption" color="dim" style={{ marginTop: 6 }}>
            {hint}
          </Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';
