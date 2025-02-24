import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { colors } from '@/styles/common';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function AppLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // User is authenticated - render the app layout
  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen 
            name="timesheet"
            options={{
              title: 'Timesheet',
            }}
          />
          {user?.role === 'ADMIN' && (
            <Stack.Screen 
              name="admin"
              options={{
                title: 'Admin',
              }}
            />
          )}
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