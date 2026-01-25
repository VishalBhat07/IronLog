import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import SplashScreen from '@/components/SplashScreen';
import { AuthProvider, useAuth } from '@/context/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

// This component handles navigation based on auth state
// It MUST be inside Stack to have navigation context
function AuthNavigator() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const isAuthRoute = segments[0] === 'auth';

    if (!user && !isAuthRoute) {
      router.replace('/auth');
    } else if (user && isAuthRoute) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return null; // This component only handles navigation logic
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isShowSplash, setIsShowSplash] = useState(true);

  if (isShowSplash) {
    return <SplashScreen onFinish={() => setIsShowSplash(false)} />;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="workout-session" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="add-exercise" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="workout-history" options={{ headerShown: false }} />
          <Stack.Screen name="workout-details/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="workout-complete" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <AuthNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
