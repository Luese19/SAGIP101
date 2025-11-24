import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Screens
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import LobbyScreen from './screens/LobbyScreen';
import RoomWaitingScreen from './screens/RoomWaitingScreen';
import GameScreen from './screens/GameScreen';

// Navigation
const Stack = createStackNavigator();

const AppContainer = ({ children }) => {
  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.gradient}
    >
      {children}
    </LinearGradient>
  );
};

const LoadingScreen = () => (
  <AppContainer>
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="white" />
      <StatusBar style="light" />
    </View>
  </AppContainer>
);

function AppNavigator() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' }
      }}
    >
      {!currentUser ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Lobby" component={LobbyScreen} />
          <Stack.Screen name="RoomWaiting" component={RoomWaitingScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});