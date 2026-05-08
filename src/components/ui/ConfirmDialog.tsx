import React, { useState } from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Modal } from './Modal';
import { Text } from './Text';
import { Button } from './Button';

type Tone = 'default' | 'danger' | 'warning' | 'success';
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: IconName;
  tone?: Tone;
  destructive?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
}

const TONE_DEFAULTS: Record<Tone, { icon: IconName }> = {
  default: { icon: 'information-outline' },
  danger: { icon: 'trash-can-outline' },
  warning: { icon: 'alert-outline' },
  success: { icon: 'check-circle-outline' },
};

export const ConfirmDialog: React.FC<Props> = ({
  visible,
  onClose,
  title,
  description,
  icon,
  tone = 'default',
  destructive,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
}) => {
  const t = useTheme();
  const [busy, setBusy] = useState(false);
  const effectiveTone: Tone = destructive ? 'danger' : tone;

  const toneColor = {
    default: t.colors.primary,
    danger: t.colors.danger,
    warning: t.colors.warning,
    success: t.colors.success,
  }[effectiveTone];

  const toneSoft = {
    default: t.colors.primarySoft,
    danger: t.colors.dangerSoft,
    warning: t.colors.warningSoft,
    success: t.colors.successSoft,
  }[effectiveTone];

  const resolvedIcon = icon ?? TONE_DEFAULTS[effectiveTone].icon;
  const confirmVariant = effectiveTone === 'danger' ? 'danger' : 'primary';

  const handleConfirm = async () => {
    try {
      setBusy(true);
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} onClose={busy ? () => {} : onClose} dismissOnBackdrop={!busy}>
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: toneSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: t.spacing.lg,
            borderWidth: 1,
            borderColor: toneColor + '33',
          }}
        >
          <MaterialCommunityIcons name={resolvedIcon} size={28} color={toneColor} />
        </View>
        <Text variant="h2" align="center">
          {title}
        </Text>
        {description ? (
          <Text
            variant="body"
            color="muted"
            align="center"
            style={{ marginTop: t.spacing.sm }}
          >
            {description}
          </Text>
        ) : null}
      </View>
      <View
        style={{
          flexDirection: 'row',
          gap: t.spacing.md,
          marginTop: t.spacing.xxl,
        }}
      >
        <Button
          title={cancelLabel}
          variant="secondary"
          onPress={onClose}
          style={{ flex: 1 }}
          disabled={busy}
        />
        <Button
          title={confirmLabel}
          variant={confirmVariant}
          onPress={handleConfirm}
          style={{ flex: 1 }}
          loading={busy}
        />
      </View>
    </Modal>
  );
};
