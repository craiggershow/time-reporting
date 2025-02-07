import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="timesheets" />
      <Stack.Screen name="users" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="settings" />
    </Stack>
  );
} 