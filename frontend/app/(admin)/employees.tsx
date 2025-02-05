import { View, StyleSheet, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { buildApiUrl } from '@/constants/Config';
import { User } from '@/types/auth';

interface Employee extends User {
  timesheetCount: number;
  pendingTimesheets: number;
}

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl('EMPLOYEES'), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load employees');
      }

      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      setError(error instanceof Error ? error.message : 'Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  }

  function renderEmployee({ item }: { item: Employee }) {
    return (
      <Card style={styles.employeeCard}>
        <View style={styles.employeeHeader}>
          <ThemedText style={styles.name}>
            {item.firstName} {item.lastName}
          </ThemedText>
          <ThemedText style={styles.email}>{item.email}</ThemedText>
        </View>
        <View style={styles.stats}>
          <StatItem 
            label="Total Timesheets" 
            value={item.timesheetCount} 
          />
          <StatItem 
            label="Pending" 
            value={item.pendingTimesheets}
            highlight={item.pendingTimesheets > 0} 
          />
        </View>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <Button onPress={() => {/* TODO: Add new employee */}}>
        Add Employee
      </Button>

      {error ? (
        <ThemedText style={styles.error}>{error}</ThemedText>
      ) : (
        <FlatList
          data={employees}
          renderItem={renderEmployee}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={loadEmployees}
        />
      )}
    </View>
  );
}

function StatItem({ label, value, highlight }: { 
  label: string; 
  value: number;
  highlight?: boolean;
}) {
  return (
    <View style={styles.statItem}>
      <ThemedText 
        style={[
          styles.statValue,
          highlight && styles.highlightedValue
        ]}
      >
        {value}
      </ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  list: {
    gap: 16,
    paddingTop: 16,
  },
  employeeCard: {
    padding: 16,
  },
  employeeHeader: {
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  highlightedValue: {
    color: '#ef4444',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  error: {
    textAlign: 'center',
    marginTop: 20,
    color: '#ef4444',
  },
}); 