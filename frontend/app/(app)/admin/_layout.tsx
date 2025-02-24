import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { colors } from '@/styles/common';

export const unstable_settings = {
  initialRouteName: 'index',
};

function useProtectedRoute() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }

    if (user?.role !== 'ADMIN') {
      router.replace('/(app)/timesheet');
      return;
    }
  }, [isAuthenticated, user]);
}


export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.page },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Admin Dashboard',
          headerShown: false 
        }} 
      />
      <Stack.Screen name="employees" />
      <Stack.Screen name="pay-periods" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="timesheets" />
      <Stack.Screen 
        name="users"
        options={{ headerShown: false }}
      />
    </Stack>
  );
} 