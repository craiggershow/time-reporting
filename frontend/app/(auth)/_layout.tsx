import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Redirect } from 'expo-router';
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
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect authenticated users
  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  /**
   * Render auth-related screens for unauthenticated users
   * 
   * Stack configuration:
   * - Headers are hidden
   * - Only login screen is available in auth stack
   */
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="login" 
        options={{ 
          title: 'Login',
        }} 
      />
    </Stack>
  );
} 