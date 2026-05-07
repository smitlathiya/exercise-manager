import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import type { TabParamList } from './types';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { WorkoutsScreen } from '@/screens/workouts/WorkoutsScreen';
import { ExercisesScreen } from '@/screens/exercises/ExercisesScreen';
import { BodyScreen } from '@/screens/body/BodyScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const tabIcon = (label: string) => () => (
  <Text variant="caption" weight="700" style={{ fontSize: 11 }}>
    {label}
  </Text>
);

export const Tabs: React.FC = () => {
  const t = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.colors.primary,
        tabBarInactiveTintColor: t.colors.textDim,
        tabBarStyle: {
          backgroundColor: t.colors.bgElevated,
          borderTopColor: t.colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: tabIcon('●') }} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} options={{ tabBarIcon: tabIcon('▶') }} />
      <Tab.Screen name="Exercises" component={ExercisesScreen} options={{ tabBarIcon: tabIcon('≡') }} />
      <Tab.Screen name="Body" component={BodyScreen} options={{ tabBarIcon: tabIcon('◇') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: tabIcon('⚙') }} />
    </Tab.Navigator>
  );
};
