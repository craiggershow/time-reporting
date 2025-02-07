import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function TimesheetManagement() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.isAdmin) {
      router.replace('/(app)');
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
          <ThemedText type="title">Timesheet Management</ThemedText>
          <ThemedText style={styles.subtitle}>
            Review and approve employee timesheets
          </ThemedText>
          
          {/* Add timesheet management interface here */}
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
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
}); 