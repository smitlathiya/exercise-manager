import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface Props {
  title: string;
  subtitle?: string;
  trailingText?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  destructive?: boolean;
  style?: ViewStyle;
  disabled?: boolean;
}

export const ListItem: React.FC<Props> = ({
  title,
  subtitle,
  trailingText,
  leading,
  trailing,
  showChevron,
  onPress,
  destructive,
  style,
  disabled,
}) => {
  const t = useTheme();
  const titleColor = destructive ? t.colors.danger : t.colors.text;

  const content = (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: t.spacing.md,
          paddingHorizontal: t.spacing.lg,
          gap: t.spacing.md,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {leading ? <View>{leading}</View> : null}
      <View style={{ flex: 1 }}>
        <Text variant="bodyBold" style={{ color: titleColor }}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="muted" style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailingText ? (
        <Text variant="body" color="muted">
          {trailingText}
        </Text>
      ) : null}
      {trailing}
      {showChevron ? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={t.colors.textDim}
        />
      ) : null}
    </View>
  );

  if (!onPress || disabled) return content;
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: t.colors.surfaceAlt }}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      {content}
    </Pressable>
  );
};
