import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { colors } from '@/styles/common';
import { View, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Helper function to check if we're in an auth route
function useProtectedRoute() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Check if the user is not authenticated
      if (!user) {
        // Redirect to the login page
        router.replace('/login');
      }
    }
  }, [user, isLoading]);

  if (isLoading) {
    // You might want to show a loading screen here
    return null;
  }

  return user;
}

export default function AppLayout() {
  const user = useProtectedRoute();

  // Don't render anything until we have checked authentication
  if (!user) {
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