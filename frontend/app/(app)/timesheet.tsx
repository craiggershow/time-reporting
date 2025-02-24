import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { startOfWeek, addWeeks } from 'date-fns';
import { ThemedText } from '@/components/ThemedText';
import { WeekTable } from '@/components/timesheet/WeekTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTimesheet } from '@/context/TimesheetContext';
import { WeekData, TimeEntry, DayType, TimesheetData } from '@/types/timesheet';
import { calculateTotalRegularHours } from '../../utils/timeCalculations';
import { createEmptyWeekData, calculateWeekTotalHours } from '@/context/TimesheetContext';
import { Header } from '@/components/layout/Header';
import { useTheme } from '@/context/ThemeContext';
import { API_BASE_URL, buildApiUrl, API_ENDPOINTS } from '@/constants/Config';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { TimesheetForm } from '@/components/TimesheetForm';
import { convertTo24Hour, convertTo12Hour } from '../../utils/time';
import { validateTimeEntry, validateWeeklyHours } from '@/utils/timeValidation';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface DayData {
  startTime: string | null;
  endTime: string | null;
  lunchStartTime: string | null;
  lunchEndTime: string | null;
  dayType: DayType;
  totalHours: number;
}

interface WeekData {
  id: string;
  weekNumber: number;
  extraHours: number;
  days: Array<{
    id: string;
    dayOfWeek: DayOfWeek;
    dayType: DayType;
    startTime: string | null;
    endTime: string | null;
    lunchStartTime: string | null;
    lunchEndTime: string | null;
    totalHours: number;
  }>;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

export default function TimesheetScreen() {
  const { 
    currentTimesheet, 
    isLoading: timesheetLoading, 
    error: timesheetError, 
    fetchCurrentTimesheet 
  } = useTimesheet();
  const { colors } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const [autoSubmitStatus, setAutoSubmitStatus] = useState<{
    isError: boolean;
    message: string | null;
  } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { settings, isLoading: settingsLoading } = useSettings();

  useEffect(() => {
    fetchCurrentTimesheet();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const autoSubmit = async (newState: TimesheetData) => {
    // First check if this is a start time without an end time
    const weekKey = Object.keys(newState).find(key => key.startsWith('week')) as 'week1' | 'week2';
    const dayKey = DAYS.find(day => {
      const entry = newState[weekKey][day];
      return (entry.startTime && !entry.endTime) || (entry.lunchStartTime && !entry.lunchEndTime);
    });

    if (dayKey) {
      console.log('Waiting for end time to be entered');
      return; // Exit early if we're waiting for an end time
    }

    // Now check if we have any complete pairs to submit
    const hasCompletePairs = ['week1', 'week2'].some(weekKey => {
      return DAYS.some(day => {
        const entry = newState[weekKey as 'week1' | 'week2'][day];
        return (
          (entry.startTime && entry.endTime) || // Complete work time pair
          (entry.lunchStartTime && entry.lunchEndTime) // Complete lunch time pair
        );
      });
    });

    if (!hasCompletePairs) {
      console.log('No complete time pairs to submit');
      return; // Don't submit if we don't have any complete pairs
    }

    try {
      setIsSaving(true);
      setAutoSubmitStatus(null);

      // Get current timesheet for payPeriodId first
      const currentResponse = await fetch(buildApiUrl('CURRENT_TIMESHEET'), {
        credentials: 'include',
      });

      if (!currentResponse.ok) {
        const errorData = await currentResponse.json();
        throw new Error(errorData.error || 'Failed to get current timesheet');
      }

      const currentTimesheet = await currentResponse.json();
      if (!currentTimesheet.payPeriod?.id) {
        throw new Error('No payPeriodId found');
      }

      // Use the same submit data format as handleSubmit
      const submitData = {
        payPeriodId: currentTimesheet.payPeriod.id,
        vacationHours: newState.vacationHours,
        weeks: [
          {
            weekNumber: 1,
            extraHours: newState.week1.extraHours || 0,
            monday: {
              startTime: convertTo24Hour(newState.week1.monday.startTime),
              endTime: convertTo24Hour(newState.week1.monday.endTime),
              lunchStartTime: convertTo24Hour(newState.week1.monday.lunchStartTime),
              lunchEndTime: convertTo24Hour(newState.week1.monday.lunchEndTime),
              dayType: newState.week1.monday.dayType.toUpperCase(),
              totalHours: newState.week1.monday.totalHours,
            },
            tuesday: {
              startTime: convertTo24Hour(newState.week1.tuesday.startTime),
              endTime: convertTo24Hour(newState.week1.tuesday.endTime),
              lunchStartTime: convertTo24Hour(newState.week1.tuesday.lunchStartTime),
              lunchEndTime: convertTo24Hour(newState.week1.tuesday.lunchEndTime),
              dayType: newState.week1.tuesday.dayType.toUpperCase(),
              totalHours: newState.week1.tuesday.totalHours,
            },
            wednesday: {
              startTime: convertTo24Hour(newState.week1.wednesday.startTime),
              endTime: convertTo24Hour(newState.week1.wednesday.endTime),
              lunchStartTime: convertTo24Hour(newState.week1.wednesday.lunchStartTime),
              lunchEndTime: convertTo24Hour(newState.week1.wednesday.lunchEndTime),
              dayType: newState.week1.wednesday.dayType.toUpperCase(),
              totalHours: newState.week1.wednesday.totalHours,
            },
            thursday: {
              startTime: convertTo24Hour(newState.week1.thursday.startTime),
              endTime: convertTo24Hour(newState.week1.thursday.endTime),
              lunchStartTime: convertTo24Hour(newState.week1.thursday.lunchStartTime),
              lunchEndTime: convertTo24Hour(newState.week1.thursday.lunchEndTime),
              dayType: newState.week1.thursday.dayType.toUpperCase(),
              totalHours: newState.week1.thursday.totalHours,
            },
            friday: {
              startTime: convertTo24Hour(newState.week1.friday.startTime),
              endTime: convertTo24Hour(newState.week1.friday.endTime),
              lunchStartTime: convertTo24Hour(newState.week1.friday.lunchStartTime),
              lunchEndTime: convertTo24Hour(newState.week1.friday.lunchEndTime),
              dayType: newState.week1.friday.dayType.toUpperCase(),
              totalHours: newState.week1.friday.totalHours,
            },
          },
          {
            weekNumber: 2,
            extraHours: newState.week2.extraHours || 0,
            monday: {
              startTime: convertTo24Hour(newState.week2.monday.startTime),
              endTime: convertTo24Hour(newState.week2.monday.endTime),
              lunchStartTime: convertTo24Hour(newState.week2.monday.lunchStartTime),
              lunchEndTime: convertTo24Hour(newState.week2.monday.lunchEndTime),
              dayType: newState.week2.monday.dayType.toUpperCase(),
              totalHours: newState.week2.monday.totalHours,
            },
            tuesday: {
              startTime: convertTo24Hour(newState.week2.tuesday.startTime),
              endTime: convertTo24Hour(newState.week2.tuesday.endTime),
              lunchStartTime: convertTo24Hour(newState.week2.tuesday.lunchStartTime),
              lunchEndTime: convertTo24Hour(newState.week2.tuesday.lunchEndTime),
              dayType: newState.week2.tuesday.dayType.toUpperCase(),
              totalHours: newState.week2.tuesday.totalHours,
            },
            wednesday: {
              startTime: convertTo24Hour(newState.week2.wednesday.startTime),
              endTime: convertTo24Hour(newState.week2.wednesday.endTime),
              lunchStartTime: convertTo24Hour(newState.week2.wednesday.lunchStartTime),
              lunchEndTime: convertTo24Hour(newState.week2.wednesday.lunchEndTime),
              dayType: newState.week2.wednesday.dayType.toUpperCase(),
              totalHours: newState.week2.wednesday.totalHours,
            },
            thursday: {
              startTime: convertTo24Hour(newState.week2.thursday.startTime),
              endTime: convertTo24Hour(newState.week2.thursday.endTime),
              lunchStartTime: convertTo24Hour(newState.week2.thursday.lunchStartTime),
              lunchEndTime: convertTo24Hour(newState.week2.thursday.lunchEndTime),
              dayType: newState.week2.thursday.dayType.toUpperCase(),
              totalHours: newState.week2.thursday.totalHours,
            },
            friday: {
              startTime: convertTo24Hour(newState.week2.friday.startTime),
              endTime: convertTo24Hour(newState.week2.friday.endTime),
              lunchStartTime: convertTo24Hour(newState.week2.friday.lunchStartTime),
              lunchEndTime: convertTo24Hour(newState.week2.friday.lunchEndTime),
              dayType: newState.week2.friday.dayType.toUpperCase(),
              totalHours: newState.week2.friday.totalHours,
            },
          },
        ],
      };

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
        throw new Error(errorData.error || 'Failed to submit timesheet');
      }

      // Clear any previous error status on successful submit
      setAutoSubmitStatus(null);

      Alert.alert(
        'Success',
        'Timesheet submitted successfully',
        [{ text: 'OK', onPress: () => router.replace('/(app)') }]
      );
      } catch (error) {
      console.error('Auto-submit error:', error);
      setAutoSubmitStatus({
        isError: true,
        message: error instanceof Error ? error.message : 'Failed to submit timesheet'
        });
      } finally {
      setIsSaving(false);
      }
    };

  const handleTimeUpdate = (week: 1 | 2, day: keyof WeekData, field: keyof TimeEntry, value: string | null) => {
    if (!currentTimesheet) return;

    const weekKey = `week${week}` as const;
    const currentEntry = currentTimesheet[weekKey][day];
    
    console.log('Updating time entry:', { 
      week, 
      day, 
      field, 
      value, 
      currentEntry,
      weekKey,
      currentState: currentTimesheet[weekKey]
    });
    
    const updatedEntry: TimeEntry = {
      ...currentEntry,
      [field]: value,
      totalHours: calculateTotalRegularHours({
        ...currentEntry,
        [field]: value,
      }),
    };

    fetchCurrentTimesheet({
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
      currentState: currentTimesheet[weekKey][day]
    });

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-submit
    saveTimeoutRef.current = setTimeout(() => {
      autoSubmit(currentTimesheet!);
    }, 2000);
  };

  const handleDayTypeChange = (week: 1 | 2, day: keyof WeekData, type: DayType) => {
    if (!currentTimesheet) return;

    const weekKey = `week${week}` as const;
    const currentEntry = currentTimesheet[weekKey][day];
    
    fetchCurrentTimesheet({
      type: 'UPDATE_TIME_ENTRY',
      payload: {
        week,
        day,
        entry: { ...currentEntry, dayType: type },
      },
    });
  };

  const handleExtraHoursChange = (week: 1 | 2, hours: number) => {
    fetchCurrentTimesheet({
      type: 'SET_EXTRA_HOURS',
      payload: { week, hours },
    });
  };

  const handleVacationHoursChange = (value: string) => {
    const hours = parseFloat(value) || 0;
    fetchCurrentTimesheet({
      type: 'UPDATE_VACATION_HOURS',
      payload: hours
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

  // Don't validate until settings are loaded
  const hasValidationErrors = () => {
    if (!currentTimesheet || settingsLoading) return false;

    const weeks = ['week1', 'week2'] as const;
    for (const week of weeks) {
      for (const day of DAYS) {
        const entry = currentTimesheet[week][day];
        console.log('hasValidationErrors - entry:', entry);
        const validation = validateTimeEntry(entry, settings);
        if (!validation.isValid) return true;
      }

      const weekTotal = DAYS.reduce(
        (sum, day) => sum + currentTimesheet![week][day].totalHours,
        currentTimesheet[week].extraHours || 0
      );
      const weekValidation = validateWeeklyHours(weekTotal, settings);
      if (!weekValidation.isValid) return true;
    }
    return false;
  };

  // Add a function to collect all validation errors
  const getValidationErrors = () => {
    if (!currentTimesheet) return ['No timesheet data available'];
    
    const errors: string[] = [];
    const weeks = ['week1', 'week2'] as const;
    console.log('getValidationErrors - currentTimesheet:', currentTimesheet);
    weeks.forEach((week) => {
      // Check each day in the week
      DAYS.forEach(day => {
        const entry = currentTimesheet?.[week]?.days?.[day];
        console.log('getValidationErrors - entry:', entry);
        const validation = validateTimeEntry(entry, settings);
        if (!validation.isValid && validation.message) {
          errors.push(`Week ${weekIndex + 1} - ${day.charAt(0).toUpperCase() + day.slice(1)}: ${validation.message}`);
        }
      });

      // Check weekly total
      //const weekTotal = DAYS.reduce(
      //  (sum, day) => sum + currentTimesheet![week][day].totalHours,
      //  currentTimesheet[week].extraHours || 0
      //);
      const weekTotal = calculateWeekTotalHours(currentTimesheet[week])
      const weekValidation = validateWeeklyHours(weekTotal, settings);
      if (!weekValidation.isValid && weekValidation.message) {
        errors.push(`Week ${weekIndex + 1}: ${weekValidation.message}`);
      }
    });

    return errors;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Check for validation errors first
      const validationErrors = getValidationErrors();
      console.log('Validation errors:', validationErrors);

      if (validationErrors.length > 0) {
        console.log('Found validation errors, showing alert');
        setIsSubmitting(false);
        Alert.alert(
          'Validation Errors',
          'Please fix the following errors before submitting:\n\n' + 
          validationErrors.join('\n'),
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('No validation errors, proceeding with submit');

      if (!currentTimesheet) {
        setIsSubmitting(false);
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
        vacationHours: currentTimesheet.vacationHours,
        weeks: [
          {
            weekNumber: 1,
            extraHours: currentTimesheet.week1.extraHours || 0,
            monday: {
              startTime: convertTo24Hour(currentTimesheet.week1.monday.startTime),
              endTime: convertTo24Hour(currentTimesheet.week1.monday.endTime),
              lunchStartTime: convertTo24Hour(currentTimesheet.week1.monday.lunchStartTime),
              lunchEndTime: convertTo24Hour(currentTimesheet.week1.monday.lunchEndTime),
              dayType: currentTimesheet.week1.monday.dayType.toUpperCase(),
              totalHours: currentTimesheet.week1.monday.totalHours,
            },
            tuesday: {
              startTime: convertTo24Hour(currentTimesheet.week1.tuesday.startTime),
              endTime: convertTo24Hour(currentTimesheet.week1.tuesday.endTime),
              lunchStartTime: convertTo24Hour(currentTimesheet.week1.tuesday.lunchStartTime),
              lunchEndTime: convertTo24Hour(currentTimesheet.week1.tuesday.lunchEndTime),
              dayType: currentTimesheet.week1.tuesday.dayType.toUpperCase(),
              totalHours: currentTimesheet.week1.tuesday.totalHours,
            },
            wednesday: {
              startTime: convertTo24Hour(currentTimesheet.week1.wednesday.startTime),
              endTime: convertTo24Hour(currentTimesheet.week1.wednesday.endTime),
              lunchStartTime: convertTo24Hour(currentTimesheet.week1.wednesday.lunchStartTime),
              lunchEndTime: convertTo24Hour(currentTimesheet.week1.wednesday.lunchEndTime),
              dayType: currentTimesheet.week1.wednesday.dayType.toUpperCase(),
              totalHours: currentTimesheet.week1.wednesday.totalHours,
            },
            thursday: {
              startTime: convertTo24Hour(currentTimesheet.week1.thursday.startTime),
              endTime: convertTo24Hour(currentTimesheet.week1.thursday.endTime),
              lunchStartTime: convertTo24Hour(currentTimesheet.week1.thursday.lunchStartTime),
              lunchEndTime: convertTo24Hour(currentTimesheet.week1.thursday.lunchEndTime),
              dayType: currentTimesheet.week1.thursday.dayType.toUpperCase(),
              totalHours: currentTimesheet.week1.thursday.totalHours,
            },
            friday: {
              startTime: convertTo24Hour(currentTimesheet.week1.friday.startTime),
              endTime: convertTo24Hour(currentTimesheet.week1.friday.endTime),
              lunchStartTime: convertTo24Hour(currentTimesheet.week1.friday.lunchStartTime),
              lunchEndTime: convertTo24Hour(currentTimesheet.week1.friday.lunchEndTime),
              dayType: currentTimesheet.week1.friday.dayType.toUpperCase(),
              totalHours: currentTimesheet.week1.friday.totalHours,
            },
          },
          {
            weekNumber: 2,
            extraHours: currentTimesheet.week2.extraHours || 0,
            monday: {
              startTime: convertTo24Hour(currentTimesheet.week2.monday.startTime),
              endTime: convertTo24Hour(currentTimesheet.week2.monday.endTime),
              lunchStartTime: convertTo24Hour(currentTimesheet.week2.monday.lunchStartTime),
              lunchEndTime: convertTo24Hour(currentTimesheet.week2.monday.lunchEndTime),
              dayType: currentTimesheet.week2.monday.dayType.toUpperCase(),
              totalHours: currentTimesheet.week2.monday.totalHours,
            },
            tuesday: {
              startTime: convertTo24Hour(currentTimesheet.week2.tuesday.startTime),
              endTime: convertTo24Hour(currentTimesheet.week2.tuesday.endTime),
              lunchStartTime: convertTo24Hour(currentTimesheet.week2.tuesday.lunchStartTime),
              lunchEndTime: convertTo24Hour(currentTimesheet.week2.tuesday.lunchEndTime),
              dayType: currentTimesheet.week2.tuesday.dayType.toUpperCase(),
              totalHours: currentTimesheet.week2.tuesday.totalHours,
            },
            wednesday: {
              startTime: convertTo24Hour(currentTimesheet.week2.wednesday.startTime),
              endTime: convertTo24Hour(currentTimesheet.week2.wednesday.endTime),
              lunchStartTime: convertTo24Hour(currentTimesheet.week2.wednesday.lunchStartTime),
              lunchEndTime: convertTo24Hour(currentTimesheet.week2.wednesday.lunchEndTime),
              dayType: currentTimesheet.week2.wednesday.dayType.toUpperCase(),
              totalHours: currentTimesheet.week2.wednesday.totalHours,
            },
            thursday: {
              startTime: convertTo24Hour(currentTimesheet.week2.thursday.startTime),
              endTime: convertTo24Hour(currentTimesheet.week2.thursday.endTime),
              lunchStartTime: convertTo24Hour(currentTimesheet.week2.thursday.lunchStartTime),
              lunchEndTime: convertTo24Hour(currentTimesheet.week2.thursday.lunchEndTime),
              dayType: currentTimesheet.week2.thursday.dayType.toUpperCase(),
              totalHours: currentTimesheet.week2.thursday.totalHours,
            },
            friday: {
              startTime: convertTo24Hour(currentTimesheet.week2.friday.startTime),
              endTime: convertTo24Hour(currentTimesheet.week2.friday.endTime),
              lunchStartTime: convertTo24Hour(currentTimesheet.week2.friday.lunchStartTime),
              lunchEndTime: convertTo24Hour(currentTimesheet.week2.friday.lunchEndTime),
              dayType: currentTimesheet.week2.friday.dayType.toUpperCase(),
              totalHours: currentTimesheet.week2.friday.totalHours,
            },
          },
        ],
      };

      // Log the data before submission
      console.log('Submitting timesheet data:', {
        payPeriodId: submitData.payPeriodId,
        weeks: submitData.weeks.map(week => ({
          ...week,
          monday: { ...week.monday, startTime: week.monday.startTime },  // Log specific times
          // ... other days
        })),
      });

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

      setHasUnsavedChanges(false);
      setIsSubmitted(true);
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
    if (!currentTimesheet?.week1) return;
    
    fetchCurrentTimesheet({
      type: 'SET_PAY_PERIOD',
      payload: {
        ...currentTimesheet,
        week2: { ...currentTimesheet.week1 },
      },
    });
  };

  const handleCopyPrevious = (week: 1 | 2, day: keyof WeekData) => {
    if (!currentTimesheet) return;

    const weekData = currentTimesheet[`week${week}`];
    const days = Object.keys(weekData) as (keyof WeekData)[];
    const currentDayIndex = days.indexOf(day);
    
    if (currentDayIndex <= 0) return;
    
    const previousDay = days[currentDayIndex - 1];
    const previousEntry = weekData[previousDay];
    
    fetchCurrentTimesheet({
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

  if (timesheetLoading) {
    return (
      <View style={styles.container}>
        <Header />
        <LoadingSpinner />
      </View>
    );
  }

  if (timesheetError) {
    return (
      <View style={styles.container}>
        <Header />
        <ErrorMessage message={timesheetError} />
      </View>
    );
  }

  if (!currentTimesheet) {
    return (
      <View style={styles.container}>
        <Header />
        <ErrorMessage message="No timesheet found for current pay period" />
      </View>
    );
  }

  // Calculate totals based on the new structure
  //const week1 = currentTimesheet.weeks.find(w => w.weekNumber === 1);
  //const week2 = currentTimesheet.weeks.find(w => w.weekNumber === 2);
  const week1 = currentTimesheet.week1;
  //console.log('week1Total:', week1);
  const week2 = currentTimesheet.week2;
  console.log('week2Total:', week2);

  const week1Total = calculateWeekTotal(week1);
  console.log('week1Total:', week1Total);
  const week2Total = calculateWeekTotal(week2);
  console.log('week2Total:', week2Total);

  const periodTotal = week1Total + week2Total + (currentTimesheet.vacationHours || 0);
  console.log('periodTotal:', periodTotal);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <View style={styles.contentCard}>
        <View style={styles.header}>
        </View>

        <WeekTable
            data={currentTimesheet.week1}
          weekNumber={1}
            startDate={currentTimesheet.startDate}
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
            data={currentTimesheet.week2}
          weekNumber={2}
            startDate={addWeeks(currentTimesheet.startDate, 1)}
          onUpdate={(day, field, value) => handleTimeUpdate(2, day, field, value)}
          onDayTypeChange={(day, type) => handleDayTypeChange(2, day, type)}
          onExtraHoursChange={(hours) => handleExtraHoursChange(2, hours)}
          onCopyPrevious={(day) => handleCopyPrevious(2, day)}
        />

          <View style={[styles.summary, { backgroundColor: colors.background.input }]}>
          <ThemedText type="subtitle">Summary</ThemedText>
            <View style={[styles.summaryRow, { backgroundColor: colors.background.card }]}>
            <ThemedText>Week 1 Total:</ThemedText>
            <ThemedText>{week1Total.toFixed(2)} hours</ThemedText>
          </View>
            <View style={[styles.summaryRow, { backgroundColor: colors.background.card }]}>
            <ThemedText>Week 2 Total:</ThemedText>
            <ThemedText>{week2Total.toFixed(2)} hours</ThemedText>
          </View>
            <View style={[styles.vacationHours, { backgroundColor: colors.background.card }]}>
            <ThemedText>Vacation Hours:</ThemedText>
            <Input
              label=""
                value={currentTimesheet?.vacationHours?.toString() || '0'}
              onChangeText={handleVacationHoursChange}
                style={styles.vacationInput}
              keyboardType="numeric"
            />
          </View>
            <View style={[styles.summaryRow, { backgroundColor: colors.background.card }]}>
            <ThemedText type="defaultSemiBold">Pay Period Total:</ThemedText>
            <ThemedText type="defaultSemiBold">{periodTotal.toFixed(2)} hours</ThemedText>
          </View>
        </View>

        <View style={styles.actions}>
            <SubmitButton
              onPress={handleSubmit}
              isSubmitting={isSubmitting}
              validationErrors={getValidationErrors()}
            />
          <Button 
            variant="secondary" 
            onPress={handleRecall}
            style={styles.recallButton}
          >
            Recall Previous Submission
          </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function calculateWeekTotal(week: WeekData | undefined): number {
  console.log('calculateWeekTotal - weekData:', week);
  
  if (!week) {
    console.log('calculateWeekTotal - weekData is undefined, returning 0');
    return 0;
  }

  console.log('calculateWeekTotal - Week Data:', week);
  
  const total = week.days.totalHours + (week.extraHours || 0);
  console.log('calculateWeekTotal - final total:', total);

  return total;
}



// Helper function to process week data
function processWeekData(weekData: any) {
  console.log('Processing week data (full):', JSON.stringify(weekData, null, 2)); // Log full structure

  if (!weekData) {
    console.log('No week data provided, returning empty data');
    return createEmptyWeekData();
  }

  // Try to find the correct data structure
  const days = weekData.days || weekData.data?.days || [];
  console.log('Days array:', days);

  // Convert days array to object by day of week
  const daysObject = days.reduce((acc: any, day: any) => {
    return {
      ...acc,
      [day.dayOfWeek.toLowerCase()]: {
        startTime: day.startTime,
        endTime: day.endTime,
        lunchStartTime: day.lunchStartTime,
        lunchEndTime: day.lunchEndTime,
        dayType: day.dayType,
        totalHours: Number(day.totalHours || 0),
      },
    };
  }, {});

  console.log('Processed days object:', daysObject);

  // Process each day's data
  const processedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].reduce((acc, day) => {
    const dayData = daysObject[day] || {};
    const processed = {
      ...acc,
      [day]: {
        startTime: dayData.startTime || null,
        endTime: dayData.endTime || null,
        lunchStartTime: dayData.lunchStartTime || null,
        lunchEndTime: dayData.lunchEndTime || null,
        dayType: dayData.dayType || 'WORK',
        totalHours: Number(dayData.totalHours || 0),
      },
    };
    return processed;
  }, {});

  const result = {
    ...processedDays,
    extraHours: Number(weekData.extraHours || 0),
  };

  console.log('Final processed week data:', result);
  return result;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 16,
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
  header: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 200,
    height: 60,
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
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savingText: {
    fontSize: 12,
    color: '#64748b',
  },
  autoSubmitError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: '#fee2e2',
    borderRadius: 4,
    marginLeft: 16,
  },
  hoursInput: {
    width: 100,
    textAlign: 'right',
  },
}); 