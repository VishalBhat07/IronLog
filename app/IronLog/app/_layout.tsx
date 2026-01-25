import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

import { useState } from 'react';
import SplashScreen from '@/components/SplashScreen';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isShowSplash, setIsShowSplash] = useState(true);

  if (isShowSplash) {
      return <SplashScreen onFinish={() => setIsShowSplash(false)} />;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="workout-session" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="add-exercise" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
