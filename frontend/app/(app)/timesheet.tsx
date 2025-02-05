import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { startOfWeek, addWeeks } from 'date-fns';
import { ThemedText } from '@/components/ThemedText';
import { WeekTable } from '@/components/timesheet/WeekTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTimesheet } from '@/context/TimesheetContext';
import { WeekData, TimeEntry, DayType, TimesheetData } from '@/types/timesheet';
import { calculateTotalHours } from '../../utils/timeCalculations';
import { createEmptyWeekData } from '@/context/TimesheetContext';
import { Header } from '@/components/layout/Header';
import { useTheme } from '@/context/ThemeContext';
import { API_BASE_URL, buildApiUrl, API_ENDPOINTS } from '@/constants/Config';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { TimesheetForm } from '@/components/TimesheetForm';

export default function TimesheetScreen() {
  const { state, dispatch } = useTimesheet();
  const { colors } = useTheme();
  const [vacationHours, setVacationHours] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCurrentTimesheet = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        if (__DEV__) {
          console.log('Fetching timesheet from:', buildApiUrl('CURRENT_TIMESHEET'));
        }

        const response = await fetch(buildApiUrl('CURRENT_TIMESHEET'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }).catch(error => {
          console.error('Network error:', error);
          throw new Error('Network error - Please check your connection');
        });

        if (!response.ok) {
          console.error('Server error:', response.status, response.statusText);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data) {
          dispatch({
            type: 'SET_PAY_PERIOD',
            payload: {
              startDate: new Date(data.payPeriod.startDate),
              week1: data.weeks.find((w: any) => w.weekNumber === 1)?.data || createEmptyWeekData(),
              week2: data.weeks.find((w: any) => w.weekNumber === 2)?.data || createEmptyWeekData(),
              vacationHours: data.vacationHours || 0,
              totalHours: data.totalHours || 0,
            },
          });
          setVacationHours(data.vacationHours?.toString() || '0');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load timesheet';
        console.error('Timesheet fetch error:', error);
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        
        // If API fails, initialize with empty data
        dispatch({
          type: 'SET_PAY_PERIOD',
          payload: {
            startDate: new Date(),
            week1: createEmptyWeekData(),
            week2: createEmptyWeekData(),
            vacationHours: 0,
            totalHours: 0,
          },
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchCurrentTimesheet();
  }, []);

  const handleTimeUpdate = (week: 1 | 2, day: keyof WeekData, field: keyof TimeEntry, value: string | null) => {
    if (!state.currentPayPeriod) return;

    const weekKey = `week${week}` as const;
    const currentEntry = state.currentPayPeriod[weekKey][day];
    
    const updatedEntry: TimeEntry = {
      ...currentEntry,
      [field]: value,
      totalHours: calculateTotalHours({
        ...currentEntry,
        [field]: value,
      }),
    };

    dispatch({
      type: 'UPDATE_TIME_ENTRY',
      payload: { week, day, entry: updatedEntry },
    });
  };

  const handleDayTypeChange = (week: 1 | 2, day: keyof WeekData, type: DayType) => {
    if (!state.currentPayPeriod) return;

    const weekKey = `week${week}` as const;
    const currentEntry = state.currentPayPeriod[weekKey][day];
    
    dispatch({
      type: 'UPDATE_TIME_ENTRY',
      payload: {
        week,
        day,
        entry: { ...currentEntry, dayType: type },
      },
    });
  };

  const handleExtraHoursChange = (week: 1 | 2, hours: number) => {
    dispatch({
      type: 'SET_EXTRA_HOURS',
      payload: { week, hours },
    });
  };

  const handleVacationHoursChange = (text: string) => {
    const hours = parseFloat(text) || 0;
    setVacationHours(text);
    dispatch({
      type: 'SET_VACATION_HOURS',
      payload: hours,
    });
  };

  async function handleSubmit(data: TimesheetData) {
    try {
      setIsSubmitting(true);

      const response = await fetch(buildApiUrl('SUBMIT_TIMESHEET'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit timesheet');
      }

      Alert.alert(
        'Success',
        'Timesheet submitted successfully',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(app)'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to submit timesheet'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCopyWeek = () => {
    if (!state.currentPayPeriod?.week1) return;
    
    dispatch({
      type: 'SET_PAY_PERIOD',
      payload: {
        ...state.currentPayPeriod,
        week2: { ...state.currentPayPeriod.week1 },
      },
    });
  };

  const handleCopyPrevious = (week: 1 | 2, day: keyof WeekData) => {
    if (!state.currentPayPeriod) return;

    const weekData = state.currentPayPeriod[`week${week}`];
    const days = Object.keys(weekData) as (keyof WeekData)[];
    const currentDayIndex = days.indexOf(day);
    
    if (currentDayIndex <= 0) return;
    
    const previousDay = days[currentDayIndex - 1];
    const previousEntry = weekData[previousDay];
    
    dispatch({
      type: 'UPDATE_TIME_ENTRY',
      payload: {
        week,
        day,
        entry: { ...previousEntry },
      },
    });
  };

  const handleRecall = async () => {
    // TODO: Implement recall logic
  };

  if (state.isLoading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={styles.loadingText}>Loading timesheet...</ThemedText>
        </View>
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{state.error}</ThemedText>
          <Button 
            onPress={() => window.location.reload()} 
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      </View>
    );
  }

  if (!state.currentPayPeriod) {
    return (
      <View style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  const week1Total = calculateWeekTotal(state.currentPayPeriod.week1);
  const week2Total = calculateWeekTotal(state.currentPayPeriod.week2);
  const periodTotal = week1Total + week2Total + parseFloat(vacationHours);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">Time Sheet</ThemedText>
        </View>

        <WeekTable
          data={state.currentPayPeriod.week1}
          weekNumber={1}
          startDate={state.currentPayPeriod.startDate}
          onUpdate={(day, field, value) => handleTimeUpdate(1, day, field, value)}
          onDayTypeChange={(day, type) => handleDayTypeChange(1, day, type)}
          onExtraHoursChange={(hours) => handleExtraHoursChange(1, hours)}
          onCopyPrevious={(day) => handleCopyPrevious(1, day)}
        />

        <View style={styles.weekActions}>
          <Button variant="secondary" onPress={handleCopyWeek}>
            Copy to Week 2
          </Button>
        </View>

        <WeekTable
          data={state.currentPayPeriod.week2}
          weekNumber={2}
          startDate={addWeeks(state.currentPayPeriod.startDate, 1)}
          onUpdate={(day, field, value) => handleTimeUpdate(2, day, field, value)}
          onDayTypeChange={(day, type) => handleDayTypeChange(2, day, type)}
          onExtraHoursChange={(hours) => handleExtraHoursChange(2, hours)}
          onCopyPrevious={(day) => handleCopyPrevious(2, day)}
        />

        <View style={[styles.summary, { backgroundColor: colors.inputBackground }]}>
          <ThemedText type="subtitle">Summary</ThemedText>
          <View style={[styles.summaryRow, { backgroundColor: colors.background }]}>
            <ThemedText>Week 1 Total:</ThemedText>
            <ThemedText>{week1Total.toFixed(2)} hours</ThemedText>
          </View>
          <View style={[styles.summaryRow, { backgroundColor: colors.background }]}>
            <ThemedText>Week 2 Total:</ThemedText>
            <ThemedText>{week2Total.toFixed(2)} hours</ThemedText>
          </View>
          <View style={[styles.vacationHours, { backgroundColor: colors.background }]}>
            <ThemedText>Vacation Hours:</ThemedText>
            <Input
              label=""
              value={vacationHours}
              onChangeText={handleVacationHoursChange}
              keyboardType="numeric"
              style={styles.vacationInput}
            />
          </View>
          <View style={[styles.summaryRow, { backgroundColor: colors.background }]}>
            <ThemedText type="defaultSemiBold">Pay Period Total:</ThemedText>
            <ThemedText type="defaultSemiBold">{periodTotal.toFixed(2)} hours</ThemedText>
          </View>
        </View>

        <View style={styles.actions}>
          <Button onPress={() => handleSubmit(state.currentPayPeriod as TimesheetData)}>
            Submit Timesheet
          </Button>
          <Button 
            variant="secondary" 
            onPress={handleRecall}
            style={styles.recallButton}
          >
            Recall Previous Submission
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

function calculateWeekTotal(weekData: WeekData): number {
  const dayEntries = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
  const totalRegularHours = dayEntries
    .reduce((sum, day) => sum + weekData[day].totalHours, 0);
  
  return totalRegularHours + (weekData.extraHours || 0);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  weekActions: {
    padding: 16,
    alignItems: 'center',
  },
  summary: {
    padding: 16,
    gap: 12,
    margin: 16,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
  },
  vacationHours: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
  },
  vacationInput: {
    width: 100,
    textAlign: 'right',
  },
  actions: {
    padding: 16,
    gap: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  recallButton: {
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
  },
}); 