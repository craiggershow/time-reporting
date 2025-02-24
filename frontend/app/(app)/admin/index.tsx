import { View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/layout/Header';
import { AdminMenu } from '@/components/admin/AdminMenu';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { commonStyles } from '@/styles/common';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AdminPortal() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const isAdmin = user?.role === 'ADMIN';
    if (!isLoading && !isAdmin) {
      console.log('admin/index.tsx: Redirecting to timesheet. User role:', user?.role);
      router.replace('/(app)/timesheet');
      return;
    }
  }, [user, isLoading]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <View style={commonStyles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  // Don't render anything while redirecting
  const isAdmin = user?.role === 'ADMIN';
  if (!isAdmin) {
    return null;
  }

  return (
    <View style={commonStyles.adminContainer}>
      <Header />
      <ScrollView style={commonStyles.adminContent}>
        <View style={commonStyles.adminSection}>
          <View style={commonStyles.contentCard}>
            <ThemedText type="title">Admin Portal</ThemedText>
            <ThemedText style={commonStyles.adminSubtitle}>
              Manage timesheets, users, and system settings
            </ThemedText>
            
            <View style={commonStyles.adminMenuSection}>
              <AdminMenu />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
} 