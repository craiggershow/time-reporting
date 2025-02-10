import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '../ThemedText';
import { Button } from '../ui/Button';
import { DateTimePicker } from '../ui/DateTimePicker';
import { addDays, format, startOfDay } from 'date-fns';
import { buildApiUrl } from '@/constants/Config';

interface PayPeriodInfo {
  currentPeriod: {
    startDate: Date;
    endDate: Date;
  };
  previousPeriod: {
    startDate: Date;
    endDate: Date;
  };
}

export function PayPeriodManager() {
  const [firstPayPeriodDate, setFirstPayPeriodDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [payPeriodInfo, setPayPeriodInfo] = useState<PayPeriodInfo | null>(null);

  // Calculate pay periods based on the first date
  const calculatePayPeriods = (firstDate: Date) => {
    const baseDate = startOfDay(firstDate);
    const periodLength = 14; // 14 days for bi-weekly pay periods

    // Find the most recent pay period start date
    const now = new Date();
    const daysSinceFirst = Math.floor((now.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    const periodsElapsed = Math.floor(daysSinceFirst / periodLength);
    
    const currentStartDate = addDays(baseDate, periodsElapsed * periodLength);
    const currentEndDate = addDays(currentStartDate, periodLength - 1);
    const previousStartDate = addDays(currentStartDate, -periodLength);
    const previousEndDate = addDays(previousStartDate, periodLength - 1);

    return {
      currentPeriod: {
        startDate: currentStartDate,
        endDate: currentEndDate,
      },
      previousPeriod: {
        startDate: previousStartDate,
        endDate: previousEndDate,
      },
    };
  };

  const handleDateChange = (date: Date) => {
    setFirstPayPeriodDate(date);
    const periods = calculatePayPeriods(date);
    setPayPeriodInfo(periods);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl('SET_PAY_PERIOD_START'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstPayPeriodDate: firstPayPeriodDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save pay period settings');
      }

      // Recalculate periods after saving
      const periods = calculatePayPeriods(firstPayPeriodDate);
      setPayPeriodInfo(periods);
    } catch (error) {
      console.error('Error saving pay period:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPeriodDate = (date: Date) => {
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <ThemedText style={styles.label}>First Pay Period Start Date</ThemedText>
        <DateTimePicker
          value={firstPayPeriodDate}
          onChange={handleDateChange}
          mode="date"
        />
      </View>

      {payPeriodInfo && (
        <View style={styles.periodsInfo}>
          <View style={styles.periodSection}>
            <ThemedText style={styles.periodTitle}>Current Pay Period</ThemedText>
            <ThemedText>
              {formatPeriodDate(payPeriodInfo.currentPeriod.startDate)} - {formatPeriodDate(payPeriodInfo.currentPeriod.endDate)}
            </ThemedText>
          </View>

          <View style={styles.periodSection}>
            <ThemedText style={styles.periodTitle}>Previous Pay Period</ThemedText>
            <ThemedText>
              {formatPeriodDate(payPeriodInfo.previousPeriod.startDate)} - {formatPeriodDate(payPeriodInfo.previousPeriod.endDate)}
            </ThemedText>
          </View>
        </View>
      )}

      <Button
        onPress={handleSave}
        disabled={isLoading}
        style={styles.saveButton}
      >
        {isLoading ? 'Saving...' : 'Save Pay Period Settings'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  periodsInfo: {
    gap: 16,
  },
  periodSection: {
    gap: 4,
  },
  periodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  saveButton: {
    marginTop: 8,
  },
}); 