// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import PinScreen from '../screens/Auth/PinScreen';
import { useAppStore } from '../store/useAppStore';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  // Read the global authentication state
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Conditionally render screens based on login status */}
      {!isAuthenticated ? (
        <Stack.Screen name="LockScreen" component={PinScreen} />
      ) : (
        <Stack.Screen name="MainTabs" component={TabNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;