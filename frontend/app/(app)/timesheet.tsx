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
import { convertTo24Hour, convertTo12Hour } from '../../utils/time';

interface DayData {
  startTime: string | null;
  endTime: string | null;
  lunchStartTime: string | null;
  lunchEndTime: string | null;
  dayType: DayType;
  totalHours: number;
}

interface WeekData {
  weekNumber: number;
  extraHours: number;
  monday: DayData;
  tuesday: DayData;
  wednesday: DayData;
  thursday: DayData;
  friday: DayData;
}

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
    
    console.log('Updating time entry:', { 
      week, 
      day, 
      field, 
      value, 
      currentEntry,
      weekKey,
      currentState: state.currentPayPeriod[weekKey]
    });
    
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
      payload: { 
        week, 
        day, 
        entry: updatedEntry 
      },
    });

    // Verify state update
    console.log('After dispatch:', {
      updatedEntry,
      currentState: state.currentPayPeriod[weekKey][day]
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

  function formatTime(time: string | null): string | null {
    if (!time) return null;
    return time.substring(0, 5); // Get just HH:mm part
  }

  function formatTimeForSubmit(time: string | null): string | null {
    if (!time) return null;
    // Ensure time is in HH:mm format
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  function formatTimeEntry(entry: any) {
    return {
      startTime: convertTo24Hour(entry.startTime),
      endTime: convertTo24Hour(entry.endTime),
      lunchStartTime: convertTo24Hour(entry.lunchStartTime),
      lunchEndTime: convertTo24Hour(entry.lunchEndTime),
      dayType: entry.dayType,
      totalHours: entry.totalHours || 0,
    };
  }

  function displayTimeEntry(entry: any) {
    return {
      startTime: convertTo12Hour(entry.startTime),
      endTime: convertTo12Hour(entry.endTime),
      lunchStartTime: convertTo12Hour(entry.lunchStartTime),
      lunchEndTime: convertTo12Hour(entry.lunchEndTime),
      dayType: entry.dayType,
      totalHours: entry.totalHours,
    };
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!state.currentPayPeriod) {
        Alert.alert('Error', 'No timesheet data available');
        return;
      }

      // Get current timesheet for payPeriodId
      const currentResponse = await fetch(buildApiUrl('CURRENT_TIMESHEET'), {
        credentials: 'include',
      });

      if (!currentResponse.ok) {
        const errorData = await currentResponse.json();
        console.error('Error getting current timesheet:', errorData);
        throw new Error(errorData.error || 'Failed to get current timesheet');
      }

      const currentTimesheet = await currentResponse.json();
      console.log('Current timesheet:', currentTimesheet);

      if (!currentTimesheet.payPeriod?.id) {
        throw new Error('No payPeriodId found');
      }

      // Format data to match current timesheet structure
      const submitData = {
        payPeriodId: currentTimesheet.payPeriod.id,
        vacationHours: state.currentPayPeriod.vacationHours,
        weeks: [
          {
            weekNumber: 1,
            extraHours: state.currentPayPeriod.week1.extraHours || 0,
            monday: {
              startTime: convertTo24Hour(state.currentPayPeriod.week1.monday.startTime),
              endTime: convertTo24Hour(state.currentPayPeriod.week1.monday.endTime),
              lunchStartTime: convertTo24Hour(state.currentPayPeriod.week1.monday.lunchStartTime),
              lunchEndTime: convertTo24Hour(state.currentPayPeriod.week1.monday.lunchEndTime),
              dayType: state.currentPayPeriod.week1.monday.dayType.toUpperCase(),
              totalHours: state.currentPayPeriod.week1.monday.totalHours,
            },
            tuesday: {
              startTime: convertTo24Hour(state.currentPayPeriod.week1.tuesday.startTime),
              endTime: convertTo24Hour(state.currentPayPeriod.week1.tuesday.endTime),
              lunchStartTime: convertTo24Hour(state.currentPayPeriod.week1.tuesday.lunchStartTime),
              lunchEndTime: convertTo24Hour(state.currentPayPeriod.week1.tuesday.lunchEndTime),
              dayType: state.currentPayPeriod.week1.tuesday.dayType.toUpperCase(),
              totalHours: state.currentPayPeriod.week1.tuesday.totalHours,
            },
            wednesday: {
              startTime: convertTo24Hour(state.currentPayPeriod.week1.wednesday.startTime),
              endTime: convertTo24Hour(state.currentPayPeriod.week1.wednesday.endTime),
              lunchStartTime: convertTo24Hour(state.currentPayPeriod.week1.wednesday.lunchStartTime),
              lunchEndTime: convertTo24Hour(state.currentPayPeriod.week1.wednesday.lunchEndTime),
              dayType: state.currentPayPeriod.week1.wednesday.dayType.toUpperCase(),
              totalHours: state.currentPayPeriod.week1.wednesday.totalHours,
            },
            thursday: {
              startTime: convertTo24Hour(state.currentPayPeriod.week1.thursday.startTime),
              endTime: convertTo24Hour(state.currentPayPeriod.week1.thursday.endTime),
              lunchStartTime: convertTo24Hour(state.currentPayPeriod.week1.thursday.lunchStartTime),
              lunchEndTime: convertTo24Hour(state.currentPayPeriod.week1.thursday.lunchEndTime),
              dayType: state.currentPayPeriod.week1.thursday.dayType.toUpperCase(),
              totalHours: state.currentPayPeriod.week1.thursday.totalHours,
            },
            friday: {
              startTime: convertTo24Hour(state.currentPayPeriod.week1.friday.startTime),
              endTime: convertTo24Hour(state.currentPayPeriod.week1.friday.endTime),
              lunchStartTime: convertTo24Hour(state.currentPayPeriod.week1.friday.lunchStartTime),
              lunchEndTime: convertTo24Hour(state.currentPayPeriod.week1.friday.lunchEndTime),
              dayType: state.currentPayPeriod.week1.friday.dayType.toUpperCase(),
              totalHours: state.currentPayPeriod.week1.friday.totalHours,
            },
          },
          {
            weekNumber: 2,
            extraHours: state.currentPayPeriod.week2.extraHours || 0,
            monday: {
              startTime: convertTo24Hour(state.currentPayPeriod.week2.monday.startTime),
              endTime: convertTo24Hour(state.currentPayPeriod.week2.monday.endTime),
              lunchStartTime: convertTo24Hour(state.currentPayPeriod.week2.monday.lunchStartTime),
              lunchEndTime: convertTo24Hour(state.currentPayPeriod.week2.monday.lunchEndTime),
              dayType: state.currentPayPeriod.week2.monday.dayType.toUpperCase(),
              totalHours: state.currentPayPeriod.week2.monday.totalHours,
            },
            tuesday: {
              startTime: convertTo24Hour(state.currentPayPeriod.week2.tuesday.startTime),
              endTime: convertTo24Hour(state.currentPayPeriod.week2.tuesday.endTime),
              lunchStartTime: convertTo24Hour(state.currentPayPeriod.week2.tuesday.lunchStartTime),
              lunchEndTime: convertTo24Hour(state.currentPayPeriod.week2.tuesday.lunchEndTime),
              dayType: state.currentPayPeriod.week2.tuesday.dayType.toUpperCase(),
              totalHours: state.currentPayPeriod.week2.tuesday.totalHours,
            },
            wednesday: {
              startTime: convertTo24Hour(state.currentPayPeriod.week2.wednesday.startTime),
              endTime: convertTo24Hour(state.currentPayPeriod.week2.wednesday.endTime),
              lunchStartTime: convertTo24Hour(state.currentPayPeriod.week2.wednesday.lunchStartTime),
              lunchEndTime: convertTo24Hour(state.currentPayPeriod.week2.wednesday.lunchEndTime),
              dayType: state.currentPayPeriod.week2.wednesday.dayType.toUpperCase(),
              totalHours: state.currentPayPeriod.week2.wednesday.totalHours,
            },
            thursday: {
              startTime: convertTo24Hour(state.currentPayPeriod.week2.thursday.startTime),
              endTime: convertTo24Hour(state.currentPayPeriod.week2.thursday.endTime),
              lunchStartTime: convertTo24Hour(state.currentPayPeriod.week2.thursday.lunchStartTime),
              lunchEndTime: convertTo24Hour(state.currentPayPeriod.week2.thursday.lunchEndTime),
              dayType: state.currentPayPeriod.week2.thursday.dayType.toUpperCase(),
              totalHours: state.currentPayPeriod.week2.thursday.totalHours,
            },
            friday: {
              startTime: convertTo24Hour(state.currentPayPeriod.week2.friday.startTime),
              endTime: convertTo24Hour(state.currentPayPeriod.week2.friday.endTime),
              lunchStartTime: convertTo24Hour(state.currentPayPeriod.week2.friday.lunchStartTime),
              lunchEndTime: convertTo24Hour(state.currentPayPeriod.week2.friday.lunchEndTime),
              dayType: state.currentPayPeriod.week2.friday.dayType.toUpperCase(),
              totalHours: state.currentPayPeriod.week2.friday.totalHours,
            },
          },
        ],
      };

      console.log('Timesheet submission payload:', JSON.stringify(submitData, null, 2));

      const response = await fetch(buildApiUrl('SUBMIT_TIMESHEET'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error submitting timesheet:', errorData);
        throw new Error(errorData.error || 'Failed to submit timesheet');
      }

      const result = await response.json();
      console.log('Submit response:', result);

      Alert.alert(
        'Success',
        'Timesheet submitted successfully',
        [{ text: 'OK', onPress: () => router.replace('/(app)') }]
      );
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to submit timesheet'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Button onPress={handleSubmit}>
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