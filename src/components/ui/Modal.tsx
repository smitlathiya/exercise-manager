import React from 'react';
import { Modal as RNModal, View, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<Props> = ({ visible, onClose, title, children }) => {
  const t = useTheme();
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: t.colors.overlay,
          justifyContent: 'center',
          padding: t.spacing.lg,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: t.colors.bgElevated,
            borderRadius: t.radius.xl,
            padding: t.spacing.xl,
            borderWidth: 1,
            borderColor: t.colors.border,
          }}
        >
          {title ? (
            <Text variant="h2" style={{ marginBottom: t.spacing.md }}>
              {title}
            </Text>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
};
