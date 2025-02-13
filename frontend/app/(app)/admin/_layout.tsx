import { Stack } from 'expo-router';
import { colors } from '@/styles/common';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.adminBackground,
        },
      }}
    >
      <Stack.Screen 
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="users"
        options={{ headerShown: false }}
      />
    </Stack>
  );
} 