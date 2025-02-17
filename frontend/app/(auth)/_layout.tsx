import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AuthLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Log navigation attempt
      console.log('Navigating user to:', user.isAdmin ? '/(app)/admin' : '/(app)/timesheet');
      
      // Use replace to prevent going back to login
      router.replace(user.isAdmin ? '/(app)/admin' : '/(app)/timesheet');
    }
  }, [user, isLoading, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Only render auth screens if user is not authenticated
  if (user) {
    return <LoadingSpinner />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ title: 'Login' }} />
    </Stack>
  );
} 