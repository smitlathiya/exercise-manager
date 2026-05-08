import React from 'react';
import { Platform, View } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui';
import type { TabParamList } from './types';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { WorkoutsScreen } from '@/screens/workouts/WorkoutsScreen';
import { ExercisesScreen } from '@/screens/exercises/ExercisesScreen';
import { BodyScreen } from '@/screens/body/BodyScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_META: Record<
  keyof TabParamList,
  { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string }
> = {
  Dashboard: { icon: 'view-dashboard-outline', label: 'Home' },
  Workouts: { icon: 'dumbbell', label: 'Workouts' },
  Exercises: { icon: 'format-list-bulleted-square', label: 'Exercises' },
  Body: { icon: 'human', label: 'Body' },
  Settings: { icon: 'cog-outline', label: 'Settings' },
};

const TabBarItem: React.FC<{
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}> = ({ label, icon, focused, onPress, onLongPress }) => {
  const t = useTheme();
  const scale = useSharedValue(focused ? 1.02 : 1);

  React.useEffect(() => {
    scale.value = withTiming(focused ? 1.05 : 1, { duration: 160 });
  }, [focused, scale]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={label}
      hitSlop={4}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 6 }}
    >
      <Animated.View
        style={[
          {
            width: 40,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: focused ? t.colors.primarySoft : 'transparent',
          },
          animStyle,
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={focused ? t.colors.primary : t.colors.textDim}
        />
      </Animated.View>
      <Text
        variant="footnote"
        style={{
          color: focused ? t.colors.primary : t.colors.textDim,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const TabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 10);

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: t.colors.bgElevated,
        borderTopColor: t.colors.divider,
        borderTopWidth: 1,
        paddingBottom: bottomPad,
        paddingTop: 4,
      }}
    >
      {state.routes.map((route, index) => {
        const meta = TAB_META[route.name as keyof TabParamList];
        const focused = state.index === index;
        return (
          <TabBarItem
            key={route.key}
            label={meta.label}
            icon={meta.icon}
            focused={focused}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name as never);
              }
            }}
            onLongPress={() =>
              navigation.emit({ type: 'tabLongPress', target: route.key })
            }
          />
        );
      })}
    </View>
  );
};

export const Tabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} />
      <Tab.Screen name="Exercises" component={ExercisesScreen} />
      <Tab.Screen name="Body" component={BodyScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};
