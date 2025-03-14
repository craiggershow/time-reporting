import { Stack } from 'expo-router';
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

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="Loading..." />
      </View>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // User is authenticated - render the app layout
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.page },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Home',
        }}
      />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.page,
  },
}); 