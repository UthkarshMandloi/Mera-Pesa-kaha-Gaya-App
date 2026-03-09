import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/constants/colors';
import { initializeDatabase, seedInitialData } from './src/database/schema';

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        initializeDatabase();
        seedInitialData();
        setIsDbReady(true);
      } catch (error) {
        console.error("Critical DB Setup Error:", error);
      }
    };

    setupDatabase();
  }, []);

  if (!isDbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }
});