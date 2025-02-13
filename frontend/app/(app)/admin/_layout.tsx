import { Stack } from 'expo-router';
import { colors } from '@/styles/common';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.adminBackground },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="employees" />
      <Stack.Screen name="pay-periods" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="timesheets" />
      <Stack.Screen name="users" />
    </Stack>
  );
} 