import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { colors } from '@/styles/common';
import { View, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const unstable_settings = {
  initialRouteName: 'index',
};

function useProtectedRoute() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!user) {
        router.replace('/(auth)/login');
        return;
      }

      // Handle admin routes
      const isAdminRoute = segments[1] === 'admin';
      if (isAdminRoute && !user.isAdmin) {
        router.replace('/(app)/timesheet');
      }
    }
  }, [user, isLoading, segments]);

  return { user, isLoading };
}

export default function AppLayout() {
  const { user, isLoading } = useProtectedRoute();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="timesheet" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="settings" />
        </Stack>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.page,
  },
}); 