import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function AppLayout() {
  return (
    <ErrorBoundary>
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#f1f5f9', // Set blue-gray background here
          },
        }}
      >
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