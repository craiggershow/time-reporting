import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { WeekData, TimeEntry, DayType } from '@/types/timesheet';
import { TimeInput } from './TimeInput';
import { DayTypeSelect } from './DayTypeSelect';
import { format, addDays } from 'date-fns';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { validateTimeEntry, validateWeeklyHours } from '@/utils/timeValidation';
import { Ionicons } from '@expo/vector-icons';
import { Tooltip } from '../ui/Tooltip';
import { useState, useEffect } from 'react';
import { timeToMinutes } from '@/utils/timeCalculations';

interface WeekTableProps {
  data: WeekData;
  weekNumber: 1 | 2;
  startDate: Date;
  onUpdate: (day: keyof WeekData, field: keyof TimeEntry, value: string | null) => void;
  onDayTypeChange: (day: keyof WeekData, type: DayType) => void;
  onExtraHoursChange: (hours: number) => void;
  onCopyPrevious: (day: keyof WeekData) => void;
}

const DAYS: (keyof WeekData)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

interface ValidationState {
  [key: string]: {
    isValid: boolean;
    message?: string;
  };
}

export function WeekTable({
  data,
  weekNumber,
  startDate,
  onUpdate,
  onDayTypeChange,
  onExtraHoursChange,
  onCopyPrevious,
}: WeekTableProps) {
  const { colors } = useTheme();
  const [validationState, setValidationState] = useState<ValidationState>({});
  const [showValidation, setShowValidation] = useState<{ [key: string]: boolean }>({});
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Calculate weekly total
  const weeklyTotal = DAYS.reduce((sum, day) => sum + data[day].totalHours, 0) + (data.extraHours || 0);

  // Calculate if any day in this week is in the future
  const today = new Date();
  const isFutureDate = (date: Date) => date > today;

  // Calculate validation for a day
  const validateDay = (day: keyof WeekData) => {
    const entry = data[day];
    return validateTimeEntry(entry);
  };

  // Separate weekly validation
  const validateWeeklyTotal = () => {
    const weekTotal = DAYS.reduce((sum, d) => sum + data[d].totalHours, 0) + (data.extraHours || 0);
    return validateWeeklyHours(weekTotal);
  };

  // Add validation status row after total hours
  const renderValidationRow = () => (
    <View style={styles.row}>
      <View style={[styles.labelCell, { backgroundColor: colors.inputBackground }]}>
        <ThemedText>Status</ThemedText>
      </View>
      {DAYS.map((day) => {
        const validation = validationState[day];
        const shouldShow = showValidation[day];
        const entry = data[day];
        const isMissingEndTime = entry.startTime && !entry.endTime;
        const isMissingLunchEndTime = entry.lunchStartTime && !entry.lunchEndTime;
        const showWarning = !validation?.isValid && !(isMissingEndTime || isMissingLunchEndTime);
        const isHovered = hoveredDay === day;

        return (
          <View key={day} style={styles.cell}>
            {shouldShow && (
              validation?.isValid ? (
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              ) : (
                <View style={styles.tooltipContainer}>
                  <View
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <Ionicons name="warning" size={20} color="#ef4444" />
                  </View>
                  {(showWarning || isHovered) && validation?.message && (
                    <Tooltip message={validation.message} />
                  )}
                </View>
              )
            )}
          </View>
        );
      })}
      <View style={styles.cell}>
        {weeklyTotal > 0 && (
          <>
            {validateWeeklyTotal().isValid ? (
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            ) : (
              <View style={styles.tooltipContainer}>
                <Ionicons name="warning" size={20} color="#ef4444" />
                <Tooltip message={validateWeeklyTotal().message || ''} />
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );

  // Update validation when input loses focus
  const handleBlur = (day: keyof WeekData) => {
    const validation = validateDay(day);
    setValidationState(prev => ({
      ...prev,
      [day]: validation
    }));
    setShowValidation(prev => ({
      ...prev,
      [day]: true
    }));
  };

  useEffect(() => {
    DAYS.forEach(day => {
      if (data[day].startTime || data[day].endTime) {
        const validation = validateDay(day);
        setValidationState(prev => ({
          ...prev,
          [day]: validation
        }));
        setShowValidation(prev => ({
          ...prev,
          [day]: true
        }));
      }
    });
  }, [data]);

  // Add a function to check if a field has an error
  const hasFieldError = (day: keyof WeekData, field: keyof TimeEntry) => {
    if (!validationState[day] || validationState[day].isValid) return false;
    
    const entry = data[day];

    // Only highlight end time fields for incomplete pairs
    switch (field) {
      case 'endTime':
        if (!entry.startTime && entry.endTime) return true;  // Missing start time
        if (entry.startTime && !entry.endTime) return false; // Don't highlight missing end time
        break;
      case 'lunchEndTime':
        if (!entry.lunchStartTime && entry.lunchEndTime) return true;  // Missing lunch start time
        if (entry.lunchStartTime && !entry.lunchEndTime) return false; // Don't highlight missing lunch end time
        break;
    }

    // If we have both times in a pair, check their values
    if (!entry.startTime || !entry.endTime) return false;

    const startMinutes = timeToMinutes(entry.startTime);
    const endMinutes = timeToMinutes(entry.endTime);
    
    switch (field) {
      case 'endTime':
        return endMinutes < startMinutes;
      case 'lunchStartTime':
        if (!entry.lunchStartTime) return false;
        const lunchStartMin = timeToMinutes(entry.lunchStartTime);
        return lunchStartMin < startMinutes || lunchStartMin > endMinutes;
      case 'lunchEndTime':
        if (!entry.lunchEndTime || !entry.lunchStartTime) return false;
        const lunchStartMinutes = timeToMinutes(entry.lunchStartTime);
        const lunchEndMinutes = timeToMinutes(entry.lunchEndTime);
        return lunchEndMinutes < startMinutes || 
               lunchEndMinutes > endMinutes || 
               lunchEndMinutes <= lunchStartMinutes;
      default:
        return false;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="subtitle">Week {weekNumber}</ThemedText>
        <ThemedText style={styles.dateRange}>
          {format(startDate, 'MMM d')} - {format(addDays(startDate, 4), 'MMM d, yyyy')}
        </ThemedText>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={[styles.row, { backgroundColor: colors.inputBackground }]}>
            <View style={styles.headerCell} />
            {DAYS.map((day, index) => (
              <View key={day} style={styles.headerCell}>
                <ThemedText style={[styles.dayName, { color: colors.text }]}>
                  {format(addDays(startDate, index), 'EEE')}
                </ThemedText>
                <ThemedText style={[styles.date, { color: colors.text }]}>
                  {format(addDays(startDate, index), 'MMM d')}
                </ThemedText>
                {index > 0 && (
                  <Button
                    variant="secondary"
                    onPress={() => onCopyPrevious(day)}
                    style={styles.copyButton}
                    textStyle={styles.copyButtonText}
                  >
                    Copy Previous
                  </Button>
                )}
              </View>
            ))}
            <View style={styles.headerCell}>
              <ThemedText style={[styles.dayName, { color: colors.text }]}>
                Extra Hours
              </ThemedText>
            </View>
          </View>

          {/* Time Rows */}
          {['Start', 'End', 'Lunch Start', 'Lunch End'].map((label, index) => (
            <View key={label} style={styles.row}>
              <View style={[styles.labelCell, { backgroundColor: colors.inputBackground }]}>
                <ThemedText>{label}</ThemedText>
              </View>
              {DAYS.map((day) => {
                const dayDate = addDays(startDate, DAYS.indexOf(day));
                const disabled = isFutureDate(dayDate);
                
                // Fix the field name mapping
                const fieldMap = {
                  'Start': 'startTime',
                  'End': 'endTime',
                  'Lunch Start': 'lunchStartTime',  // Fixed casing
                  'Lunch End': 'lunchEndTime',      // Fixed casing
                };
                
                const fieldName = fieldMap[label] as keyof TimeEntry;
                const hasError = hasFieldError(day, fieldName);
                
                return (
                  <View key={day} style={[
                    styles.cell,
                    hasError && styles.errorCell
                  ]}>
                    <TimeInput
                      value={data[day][fieldName]}
                      onChange={(value) => onUpdate(day, fieldName, value)}
                      disabled={disabled}
                      onBlur={() => handleBlur(day)}
                      hasError={hasError}
                    />
                  </View>
                );
              })}
              {label === 'Start' && (
                <View style={styles.cell}>
                  <Input
                    label=""
                    value={data.extraHours?.toString() || '0'}
                    onChangeText={(text) => onExtraHoursChange(parseFloat(text) || 0)}
                    keyboardType="numeric"
                    style={styles.extraHoursInput}
                  />
                </View>
              )}
            </View>
          ))}

          {/* Day Type Row */}
          <View style={styles.row}>
            <View style={[styles.labelCell, { backgroundColor: colors.inputBackground }]}>
              <ThemedText>Type</ThemedText>
            </View>
            {DAYS.map((day) => (
              <View key={day} style={styles.cell}>
                <DayTypeSelect
                  value={data[day].dayType}
                  onChange={(type) => onDayTypeChange(day, type)}
                />
              </View>
            ))}
          </View>

          {/* Total Hours Row */}
          <View style={styles.row}>
            <View style={[styles.labelCell, { backgroundColor: colors.inputBackground }]}>
              <ThemedText>Total Hours</ThemedText>
            </View>
            {DAYS.map((day) => (
              <View key={day} style={[
                styles.cell, 
                { backgroundColor: colors.background },
                validationState[day] && !validationState[day].isValid && styles.errorCell
              ]}>
                <ThemedText style={styles.totalHours}>
                  {data[day].totalHours.toFixed(2)}
                </ThemedText>
              </View>
            ))}
            <View style={[
              styles.cell, 
              { backgroundColor: colors.background },
              !validateWeeklyTotal().isValid && styles.errorCell
            ]}>
              <ThemedText style={[styles.totalHours, styles.weeklyTotal]}>
                {weeklyTotal.toFixed(2)}
              </ThemedText>
            </View>
          </View>

          {/* Validation Row */}
          {renderValidationRow()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  table: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'visible',
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerCell: {
    width: 140,
    padding: 8,
    alignItems: 'center',
  },
  labelCell: {
    width: 140,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cell: {
    width: 140,
    padding: 8,
    alignItems: 'center',
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    marginTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateRange: {
    fontSize: 14,
  },
  copyButton: {
    marginTop: 4,
    height: 28,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  copyButtonText: {
    fontSize: 12,
  },
  extraHoursInput: {
    width: 80,
    textAlign: 'center',
    backgroundColor: '#ffffff',
  },
  totalHours: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  weeklyTotal: {
    fontSize: 16,
    fontWeight: '700',
  },
  tooltipContainer: {
    position: 'relative',
  },
  errorCell: {
    borderWidth: 2,
    borderColor: '#ef4444',
    borderRadius: 4,
  },
  errorInput: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
}); 