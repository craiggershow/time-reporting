import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/styles/common';
/**
 * AuthLayout component handles authentication-related routing and layout
 * 
 * Key responsibilities:
 * 1. Checks authentication state
 * 2. Redirects authenticated users to appropriate screens
 * 3. Shows loading state while checking auth
 * 4. Renders auth-related screens (login, etc.) for unauthenticated users
 */
export default function AuthLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // User is already authenticated, redirect to the appropriate page
      if (user?.role === 'ADMIN') {
        router.replace('/(app)/admin');
      } else {
        router.replace('/(app)/timesheet');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="Checking authentication..." />
      </View>
    );
  }

  // Only render auth screens for unauthenticated users
  if (!isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ title: 'Login' }} />
      </Stack>
    );
  }

  // Return null while redirecting
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.page,
  },
}); 