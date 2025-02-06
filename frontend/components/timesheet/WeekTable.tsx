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

        return (
          <View key={day} style={styles.cell}>
            {shouldShow && (
              validation?.isValid ? (
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              ) : (
                <View style={styles.tooltipContainer}>
                  <Ionicons name="warning" size={20} color="#ef4444" />
                  {validation?.message && (
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
                
                return (
                  <View key={day} style={styles.cell}>
                    <TimeInput
                      value={data[day][fieldMap[label] as keyof TimeEntry]}
                      onChange={(value) => onUpdate(day, fieldMap[label] as keyof TimeEntry, value)}
                      disabled={disabled}
                      onBlur={() => handleBlur(day)}
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
              <View key={day} style={[styles.cell, { backgroundColor: colors.background }]}>
                <ThemedText style={styles.totalHours}>
                  {data[day].totalHours.toFixed(2)}
                </ThemedText>
              </View>
            ))}
            <View style={[styles.cell, { backgroundColor: colors.background }]}>
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
    overflow: 'hidden',
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
}); 