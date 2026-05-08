import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';
import { Button } from './Button';

interface Props {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?:
    | React.ReactNode
    | React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}

export const EmptyState: React.FC<Props> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  const t = useTheme();
  const iconNode =
    typeof icon === 'string' ? (
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: t.colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialCommunityIcons
          name={icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
          size={28}
          color={t.colors.primary}
        />
      </View>
    ) : (
      icon
    );

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: t.spacing.xxxl,
        paddingHorizontal: t.spacing.xl,
        gap: t.spacing.sm,
      }}
    >
      {iconNode ? <View style={{ marginBottom: t.spacing.md }}>{iconNode}</View> : null}
      <Text variant="h3" align="center">
        {title}
      </Text>
      {description ? (
        <Text variant="body" color="muted" align="center">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={{ marginTop: t.spacing.md }}
        />
      ) : null}
    </View>
  );
};
