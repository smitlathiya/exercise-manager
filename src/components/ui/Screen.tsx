import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  edges?: Edge[];
  keyboardAvoiding?: boolean;
  background?: 'bg' | 'surface';
}

export const Screen: React.FC<Props> = ({
  children,
  scroll = false,
  refreshing = false,
  onRefresh,
  padded = true,
  style,
  contentStyle,
  edges = ['top', 'left', 'right'],
  keyboardAvoiding,
  background = 'bg',
}) => {
  const t = useTheme();
  const inner: ViewStyle = padded
    ? { paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.sm, paddingBottom: t.spacing.xxxl }
    : {};

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[inner, styles.flexGrow, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.colors.primary}
            colors={[t.colors.primary]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, inner, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.flex,
        { backgroundColor: background === 'surface' ? t.colors.surface : t.colors.bg },
        style,
      ]}
    >
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexGrow: { flexGrow: 1 },
});
