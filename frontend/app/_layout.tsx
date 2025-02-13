import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '@/context/ThemeContext';
import { TimesheetProvider } from '@/context/TimesheetContext';
import { AuthProvider } from '@/context/AuthContext';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/styles/common';
import { globalStyles } from '@/styles/global';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Add custom fonts here if needed
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Insert global styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = globalStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background.page }]}>
      <AuthProvider>
        <ThemeProvider>
          <TimesheetProvider>
            <QueryClientProvider client={queryClient}>
              <View style={styles.container}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background.page },
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(app)" options={{ headerShown: false }} />
                </Stack>
              </View>
            </QueryClientProvider>
          </TimesheetProvider>
        </ThemeProvider>
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.page,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.page,
  },
});
