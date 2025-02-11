import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function AppLayout() {
  return (
    <ErrorBoundary>
      <Stack>
        <Stack.Screen 
          name="timesheet" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="admin" 
          options={{ headerShown: false }} 
        />
      </Stack>
    </ErrorBoundary>
  );
} 