import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { AdminGuard } from '@/components/AdminGuard';

export default function AdminLayout() {
  return (
    <AdminGuard>
      <Stack>
        <Stack.Screen 
          name="dashboard" 
          options={{ 
            title: 'Admin Dashboard',
            headerBackVisible: false,
          }} 
        />
        <Stack.Screen 
          name="pay-periods" 
          options={{ 
            title: 'Pay Periods',
            presentation: 'modal',
          }} 
        />
      </Stack>
    </AdminGuard>
  );
} 