import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/styles/common';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="Loading..." />
      </View>
    );
  }

  if (isAuthenticated) {
    // Redirect to the appropriate page based on user role
    return <Redirect href={user?.role === 'ADMIN' ? '/(app)/admin' : '/(app)/timesheet'} />;
  }

  // Not authenticated, redirect to login
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.page,
  },
}); 