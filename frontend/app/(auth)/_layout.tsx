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
      // Redirect authenticated users to their appropriate page
      router.replace(user.isAdmin ? '/(app)/admin' : '/(app)/timesheet');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don't render auth screens if user is authenticated
  if (user) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ title: 'Login' }} />
    </Stack>
  );
} 