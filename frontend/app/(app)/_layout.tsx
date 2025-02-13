import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { colors } from '@/styles/common';

export default function AppLayout() {
  return (
    <ErrorBoundary>
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.appBackground, // Use the new color
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