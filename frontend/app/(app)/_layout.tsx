import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { colors } from '@/styles/common';
import { View, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Helper function to check if we're in an auth route
function useProtectedRoute() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';
    
    if (!isLoading) {
      if (!user && inAppGroup) {
        // Only redirect to login if trying to access protected routes without auth
        router.replace('/login');
      } else if (user && inAuthGroup) {
        // If authenticated and on auth routes (like login), redirect to appropriate screen
        router.replace(user.isAdmin ? '/(app)/admin' : '/(app)/timesheet');
      }
    }
  }, [user, segments, isLoading]);

  return { user, isLoading };
}

export default function AppLayout() {
  const { user, isLoading } = useProtectedRoute();
  const segments = useSegments();

  // Show loading spinner while checking auth
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Only block rendering if we're trying to access app routes without auth
  if (!user && segments[0] === '(app)') {
    return null;
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.page,
  },
}); 