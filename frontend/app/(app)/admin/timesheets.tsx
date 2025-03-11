import { View, StyleSheet, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { useRouter, Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { buildApiUrl } from '@/constants/Config';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TimesheetEntry {
  id: string;
  employeeName: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  totalHours: number;
  submittedAt: string;
}

export default function TimesheetManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      router.replace('/(app)');
      return;
    }
    
    fetchTimesheets();
  }, [user]);

  async function fetchTimesheets() {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl('PENDING_TIMESHEETS'), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch timesheets');
      }

      const data = await response.json();
      setTimesheets(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(timesheetId: string) {
    try {
      const response = await fetch(buildApiUrl('APPROVE_TIMESHEET'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ timesheetId }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve timesheet');
      }

      // Refresh the list
      fetchTimesheets();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to approve timesheet');
    }
  }

  function renderTimesheet({ item }: { item: TimesheetEntry }) {
    return (
      <View style={styles.timesheetCard}>
        <View style={styles.timesheetHeader}>
          <ThemedText style={styles.employeeName}>{item.employeeName}</ThemedText>
          <View style={{
            ...styles.statusBadge,
            backgroundColor: getStatusColor(item.status)
          }}>
            <ThemedText style={styles.statusText}>{item.status}</ThemedText>
          </View>
        </View>

        <View style={styles.timesheetDetails}>
          <View style={styles.detailRow}>
            <ThemedText style={styles.label}>Pay Period:</ThemedText>
            <ThemedText>{formatDateRange(item.payPeriodStart, item.payPeriodEnd)}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.label}>Total Hours:</ThemedText>
            <ThemedText>{item.totalHours.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.label}>Submitted:</ThemedText>
            <ThemedText>{formatDate(item.submittedAt)}</ThemedText>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            onPress={() => handleApprove(item.id)}
            style={styles.approveButton}
          >
            Approve
          </Button>
          <Button
            variant="secondary"
            onPress={() => {
              console.log('View details for timesheet:', item.id);
              // For now, just log the action until we fix the navigation
            }}
          >
            View Details
          </Button>
        </View>
      </View>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Header />
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <ThemedText type="title">Timesheet Management</ThemedText>
          <View style={styles.refreshButton}>
            <Ionicons 
              name="refresh" 
              size={20} 
              color="#64748b" 
              onPress={fetchTimesheets}
            />
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        <FlatList
          data={timesheets}
          renderItem={renderTimesheet}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={fetchTimesheets}
          showsVerticalScrollIndicator={true}
          initialNumToRender={5}
        />
      </View>
    </SafeAreaView>
  );
}

function getStatusColor(status: TimesheetEntry['status']) {
  switch (status) {
    case 'APPROVED': return '#22c55e';
    case 'REJECTED': return '#ef4444';
    default: return '#f59e0b';
  }
}

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  list: {
    paddingBottom: 20,
  },
  timesheetCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timesheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  timesheetDetails: {
    marginTop: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#64748b',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  approveButton: {
    backgroundColor: '#22c55e',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
  },
}); 