import { Tabs } from 'expo-router';
import { Bell, CalendarSync, LayoutDashboard, Menu as MenuIcon, Settings } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        headerShown: true,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="renewals"
        options={{
          title: 'Renewals',
          tabBarIcon: ({ color, size }) => <CalendarSync color={color} size={size} />,
          tabBarBadge: '',
          tabBarBadgeStyle: { backgroundColor: '#EF4444', minWidth: 8, height: 8, borderRadius: 4, marginTop: 4 },
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Quick Modules',
          tabBarIcon: () => <MenuIcon color="#FFF" size={24} />,
          tabBarButton: ({ onPress, onLongPress, accessibilityState, style, accessibilityLabel, testID }) => (
            <Pressable
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="button"
              accessibilityState={accessibilityState}
              accessibilityLabel={accessibilityLabel}
              testID={testID}
              style={[
                {
                  top: -22,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                style,
              ]}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: Colors[colorScheme ?? 'light'].tint,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <MenuIcon color="#FFF" size={24} />
              </View>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Reminders',
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
          tabBarBadge: '',
          tabBarBadgeStyle: { backgroundColor: '#EF4444', minWidth: 8, height: 8, borderRadius: 4, marginTop: 4 },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
