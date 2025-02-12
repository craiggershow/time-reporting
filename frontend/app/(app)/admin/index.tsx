import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/layout/Header';
import { AdminMenu } from '@/components/admin/AdminMenu';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AdminPortal() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.isAdmin) {
      router.replace('/timesheet');
      return;
    }
  }, [user]);

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.contentCard}>
            <ThemedText type="title">Admin Portal</ThemedText>
            <ThemedText style={styles.subtitle}>
              Manage timesheets, users, and system settings
            </ThemedText>
            
            <View style={styles.menuSection}>
              <AdminMenu />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    gap: 24,
  },
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
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
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  menuSection: {
    marginTop: 24,
  },
}); 