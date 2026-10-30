import React from 'react';
import {Tabs} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Logo} from '../../src/components/Logo';
import {COLORS} from '../../src/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({base, color, focused}: {base: string; color: string; focused: boolean}) {
  return <Ionicons name={(focused ? base : `${base}-outline`) as IconName} size={24} color={color} />;
}

const tabIcon = (base: string) => {
  const render = ({color, focused}: {color: any; focused: boolean}) => (
    <TabIcon base={base} color={String(color)} focused={focused} />
  );
  return render;
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderColor: COLORS.surface,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
        },
        tabBarLabelStyle: {fontSize: 11, fontWeight: '600'},
        headerStyle: {backgroundColor: COLORS.white, borderBottomWidth: 1, borderColor: COLORS.surface},
        headerShadowVisible: false,
        headerTitle: () => <Logo />,
        headerTitleAlign: 'left',
      }}>
      <Tabs.Screen name="index" options={{title: 'Home', tabBarIcon: tabIcon('home')}} />
      <Tabs.Screen name="search" options={{title: 'Search', tabBarIcon: tabIcon('search')}} />
      <Tabs.Screen name="favorites" options={{title: 'Favorites', tabBarIcon: tabIcon('heart')}} />
      <Tabs.Screen name="messages" options={{title: 'Messages', tabBarIcon: tabIcon('chatbubble')}} />
      <Tabs.Screen name="profile" options={{title: 'Profile', tabBarIcon: tabIcon('person')}} />
    </Tabs>
  );
}
