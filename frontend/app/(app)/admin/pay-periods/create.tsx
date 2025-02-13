import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { buildApiUrl } from '@/constants/Config';
import { startOfWeek, addWeeks, format } from 'date-fns';

export default function CreatePayPeriodScreen() {
  const router = useRouter();
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [endDate, setEndDate] = useState(addWeeks(startDate, 1));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(buildApiUrl('PAY_PERIODS'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create pay period');
      }

      router.back();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create pay period');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
          minimumDate={new Date()}
        />

        <DatePicker
          label="End Date"
          value={endDate}
          onChange={setEndDate}
          minimumDate={startDate}
        />

        {error && (
          <ThemedText style={styles.error}>{error}</ThemedText>
        )}

        <Button 
          onPress={handleCreate}
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Pay Period'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  form: {
    gap: 16,
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
  },
}); 