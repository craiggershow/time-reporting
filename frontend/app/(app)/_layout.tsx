import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
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
  );
} 