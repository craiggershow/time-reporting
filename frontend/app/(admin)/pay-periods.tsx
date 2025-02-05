import { View, StyleSheet, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PayPeriod } from '@/types/payPeriod';
import { buildApiUrl } from '@/constants/Config';
import { format } from 'date-fns';

export default function PayPeriodsScreen() {
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayPeriods();
  }, []);

  async function loadPayPeriods() {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl('PAY_PERIODS'), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load pay periods');
      }

      const data = await response.json();
      setPayPeriods(data);
    } catch (error) {
      console.error('Error loading pay periods:', error);
      setError(error instanceof Error ? error.message : 'Failed to load pay periods');
    } finally {
      setIsLoading(false);
    }
  }

  function renderPayPeriod({ item }: { item: PayPeriod }) {
    return (
      <Card style={styles.periodCard}>
        <View style={styles.periodHeader}>
          <ThemedText style={styles.dateRange}>
            {format(new Date(item.startDate), 'MMM d')} - {format(new Date(item.endDate), 'MMM d, yyyy')}
          </ThemedText>
          <ThemedText style={styles.status}>
            {item.timesheets.length} Timesheets
          </ThemedText>
        </View>
        <View style={styles.stats}>
          <StatItem 
            label="Submitted" 
            value={item.timesheets.filter(t => t.status === 'SUBMITTED').length} 
          />
          <StatItem 
            label="Approved" 
            value={item.timesheets.filter(t => t.status === 'APPROVED').length} 
          />
          <StatItem 
            label="Rejected" 
            value={item.timesheets.filter(t => t.status === 'REJECTED').length} 
          />
        </View>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <Button onPress={() => {/* TODO: Add new pay period */}}>
        Add Pay Period
      </Button>

      {error ? (
        <ThemedText style={styles.error}>{error}</ThemedText>
      ) : (
        <FlatList
          data={payPeriods}
          renderItem={renderPayPeriod}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={loadPayPeriods}
        />
      )}
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statItem}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
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
  periodCard: {
    padding: 16,
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateRange: {
    fontSize: 16,
    fontWeight: '500',
  },
  status: {
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