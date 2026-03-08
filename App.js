import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useApp } from './src/context/AppContext';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import LogScreen from './src/screens/LogScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function AppContent() {
  const { isLoading, isOnboarded, selectedDog } = useApp();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isOnboarded) {
    return <OnboardingScreen />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const icons = {
              Home: focused ? 'paw' : 'paw-outline',
              Log: focused ? 'list' : 'list-outline',
              Profile: focused ? 'dog' : 'dog-outline',
              Settings: focused ? 'settings' : 'settings-outline',
            };
            // 'dog' isn't in Ionicons — use 'heart' for profile
            const iconMap = {
              Home: focused ? 'paw' : 'paw-outline',
              Log: focused ? 'list' : 'list-outline',
              Profile: focused ? 'heart' : 'heart-outline',
              Settings: focused ? 'settings' : 'settings-outline',
            };
            return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          headerShown: true,
          headerLargeTitle: route.name === 'Home',
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: selectedDog?.name || 'PawLog', headerTitle: selectedDog?.name || 'PawLog' }}
        />
        <Tab.Screen name="Log" component={LogScreen} options={{ title: 'Log' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
