import React from 'react';
import { View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface Action {
  label?: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress: () => void;
  tone?: 'default' | 'primary' | 'danger';
  accessibilityLabel?: string;
}

interface Props {
  title: string;
  subtitle?: string;
  rightAction?: Action;
  rightActions?: Action[];
  onBack?: () => void;
  large?: boolean;
}

const ActionButton: React.FC<{ action: Action }> = ({ action }) => {
  const t = useTheme();
  const color =
    action.tone === 'primary'
      ? t.colors.primary
      : action.tone === 'danger'
        ? t.colors.danger
        : t.colors.text;
  return (
    <Pressable
      hitSlop={10}
      onPress={action.onPress}
      accessibilityRole="button"
      accessibilityLabel={action.accessibilityLabel ?? action.label}
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      })}
    >
      {action.icon ? (
        <MaterialCommunityIcons name={action.icon} size={22} color={color} />
      ) : null}
      {action.label ? (
        <Text variant="bodyBold" style={{ color }}>
          {action.label}
        </Text>
      ) : null}
    </Pressable>
  );
};

export const ScreenHeader: React.FC<Props> = ({
  title,
  subtitle,
  rightAction,
  rightActions,
  onBack,
  large = true,
}) => {
  const t = useTheme();
  const actions = rightActions ?? (rightAction ? [rightAction] : []);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: t.spacing.xs,
        paddingBottom: t.spacing.lg,
        gap: t.spacing.md,
      }}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: t.colors.surface,
            borderWidth: 1,
            borderColor: t.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={22}
            color={t.colors.text}
          />
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text variant={large ? 'title' : 'h1'} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="muted" style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actions.length > 0 ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
          {actions.map((a, i) => (
            <ActionButton key={i} action={a} />
          ))}
        </View>
      ) : null}
    </View>
  );
};
