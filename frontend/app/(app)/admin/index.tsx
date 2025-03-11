import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/layout/Header';
import { AdminMenu } from '@/components/admin/AdminMenu';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { commonStyles } from '@/styles/common';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { IconButton } from '@/components/ui/IconButton';
import { Ionicons } from '@expo/vector-icons';

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
      <View style={styles.loadingContainer}>
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
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Header />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <View style={styles.card}>
            <ThemedText type="title">Admin Portal</ThemedText>
            <ThemedText style={styles.subtitle}>
              Manage timesheets, users, and system settings
            </ThemedText>
            
            <View style={styles.menuContainer}>
              <AdminMenu />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  scrollView: {
    flex: 1,
    ...Platform.select({
      android: {
        flexGrow: 1,
      }
    })
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  subtitle: {
    color: '#64748b',
    marginTop: 8,
    marginBottom: 24,
  },
  menuContainer: {
    marginTop: 16,
  }
}); 