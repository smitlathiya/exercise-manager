import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  style?: ViewStyle;
  edges?: Edge[];
}

export const Screen: React.FC<Props> = ({
  children,
  scroll = false,
  refreshing = false,
  onRefresh,
  padded = true,
  style,
  edges = ['top', 'left', 'right'],
}) => {
  const t = useTheme();
  const inner: ViewStyle = padded
    ? { paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.md, paddingBottom: t.spacing.xl }
    : {};
  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: t.colors.bg }, style]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[inner, styles.flexGrow]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={t.colors.primary}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, inner]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexGrow: { flexGrow: 1 },
});
