import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { WeekData, TimeEntry, DayType, DayOfWeek } from '@/types/timesheet';
import { TimeInput } from './TimeInput';
import { DayTypeSelect } from './DayTypeSelect';
import { format, addDays, isValid } from 'date-fns';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { validateTimeEntry, validateWeeklyHours } from '@/utils/timeValidation';
import { Ionicons } from '@expo/vector-icons';
import { Tooltip } from '../ui/Tooltip';
import { useState, useEffect } from 'react';
import { timeToMinutes } from '@/utils/timeCalculations';
import { convertTo12Hour } from '@/utils/time';
import { useSettings } from '@/context/SettingsContext';

interface WeekTableProps {
  data: WeekData;
  weekNumber: number;
  startDate: Date;
  onUpdate: (day: DayOfWeek, field: keyof DayData, value: string) => void;
  onDayTypeChange: (day: DayOfWeek, type: DayType) => void;
  onExtraHoursChange: (hours: number) => void;
  onCopyPrevious: (day: DayOfWeek) => void;
}

const DAYS: (keyof WeekData)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

interface ValidationState {
  [key: string]: {
    isValid: boolean;
    message?: string;
    messages?: string[];
  };
}

// Add a formatter function
function formatTimeForDisplay(time: string | null): string {
  if (!time) return '';
  return convertTo12Hour(time);
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
  const { settings } = useSettings();
  const [validationState, setValidationState] = useState<ValidationState>({});
  const [showValidation, setShowValidation] = useState<{ [key: string]: boolean }>({});
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [hoveredLock, setHoveredLock] = useState<string | null>(null);
  const [hoveredError, setHoveredError] = useState<string | null>(null);

  console.log('WeekTable - data:', data);
  // Calculate weekly total
  const weeklyTotal = DAYS.reduce((sum, day) => {
    if (!data || !data.days || !data.days[day]) {
      console.warn(`Missing data for day: ${day}`);
      return sum;
    }
    return sum + (data.days[day]?.totalHours || 0);
  }, 0) + (data.extraHours || 0);

  console.log('WeekTable - weeklyTotal:', weeklyTotal);

  // Calculate if any day in this week is in the future
  const today = new Date();
  const isFutureDate = (date: Date) => date > today;

  // Add a safety check for startDate
  const safeStartDate = isValid(startDate) ? startDate : new Date();

  // Calculate validation for a day
  const validateDay = (day: keyof WeekData) => {
    if (!data || !data.days || !data.days[day]) {
      console.warn(`Missing data for day: ${day}`);
      return { isValid: false, message: 'Missing data' };
    }
    
    const entry = data.days[day];
    console.log(`⚙️ WeekTable validateDay calling validateTimeEntry with settings:`, settings);
    const validation = validateTimeEntry(entry, settings);
    console.log(`⚙️ WeekTable validateDay result for ${day}:`, validation);
    return validation;
  };

  // Separate weekly validation
  const validateWeeklyTotal = () => {
    const weekTotal = DAYS.reduce((sum, d) => {
      if (!data || !data.days || !data.days[d]) {
        console.warn(`Missing data for day: ${d}`);
        return sum;
      }
      return sum + (data.days[d]?.totalHours || 0);
    }, 0) + (data.extraHours || 0);
    
    console.log(`⚙️ WeekTable validateWeeklyTotal calling validateWeeklyHours with settings:`, settings);
    return validateWeeklyHours(weekTotal, settings);
  };

  // Add validation status row after total hours
  const renderValidationRow = () => (
    <View style={styles.row}>
      <View style={[styles.labelCell, { backgroundColor: colors.background.input }]}>
        <ThemedText>Status</ThemedText>
      </View>
      {DAYS.map((day) => {
        const validation = validationState[day];
        const shouldShow = showValidation[day];
        const entry = data.days[day];
        const isMissingEndTime = entry?.startTime && !entry?.endTime;
        const isMissingLunchEndTime = entry?.lunchStartTime && !entry?.lunchEndTime;
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
                  {(isHovered) && validation?.message && (
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
      if (data.days[day]?.startTime || data.days[day]?.endTime) {
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

  // Define error message to field mapping once
  const errorFieldMap: Record<string, keyof TimeEntry> = {
    'End time cannot be later than': 'endTime',
    'Start time cannot be earlier than': 'startTime',
    'End time must be after start time': 'endTime',
    'Lunch start time must be after work start time': 'lunchStartTime',
    'Lunch end time must be before work end time': 'lunchEndTime',
    'Lunch end time must be after lunch start time': 'lunchEndTime',
    'Start time is required when end time is entered': 'startTime',
    'End time is required when start time is entered': 'endTime',
    'Lunch start time is required when lunch end time is entered': 'lunchStartTime',
    'Lunch end time is required when lunch start time is entered': 'lunchEndTime',
    'Daily hours cannot exceed': 'totalHours'
  };

  // Add a function to check if a field has an error
  const hasFieldError = (day: keyof WeekData, field: keyof TimeEntry) => {
    if (!validationState[day] || validationState[day].isValid) return false;
    
    const entry = data.days[day];
    const errorMessages = validationState[day]?.messages || [];
    
    // If we have multiple messages, check if any are relevant to this field
    if (errorMessages.length > 0) {
      return errorMessages.some(msg => isErrorForField(msg, field));
    }
    
    // Fallback to the old message property for backward compatibility
    const singleErrorMessage = validationState[day]?.message || '';
    return isErrorForField(singleErrorMessage, field);
  };

  const handleTimeUpdate = (day: keyof WeekData, field: keyof TimeEntry, value: string | null) => {
    console.log('handleTimeUpdate:', { day, field, value });
    onUpdate(day as any, field as any, value);
  };

  // Add a function to get the tooltip message for a field
  const getFieldTooltipMessage = (day: keyof WeekData, field: keyof TimeEntry) => {
    if (!validationState[day] || validationState[day].isValid) return '';
    
    const errorMessages = validationState[day]?.messages || [];
    if (errorMessages.length === 0) {
      // Fallback to the old message property for backward compatibility
      const singleErrorMessage = validationState[day]?.message || '';
      if (singleErrorMessage && isErrorForField(singleErrorMessage, field)) {
        return singleErrorMessage;
      }
      return '';
    }
    
    // Filter messages that are relevant to this field
    const relevantMessages = errorMessages.filter(msg => isErrorForField(msg, field));
    
    // Join multiple messages with line breaks
    return relevantMessages.join('\n');
  };
  
  // Helper function to check if an error message is for a specific field
  const isErrorForField = (errorMessage: string, field: keyof TimeEntry) => {
    // For the total hours field, only show daily hours exceeded errors
    if (field === 'totalHours') {
      return errorMessage.includes('Daily hours cannot exceed');
    }
    
    // For other fields, check if the error message matches the field
    for (const [errorPattern, errorField] of Object.entries(errorFieldMap)) {
      if (errorMessage.includes(errorPattern) && field === errorField) {
        return true;
      }
    }
    
    return false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="subtitle">Week {weekNumber}</ThemedText>
        <ThemedText style={styles.dateRange}>
          {format(safeStartDate, 'MMM d')} - {format(addDays(safeStartDate, 4), 'MMM d, yyyy')}
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
                  {format(addDays(safeStartDate, index), 'EEE')}
                </ThemedText>
                <ThemedText style={[styles.date, { color: colors.text }]}>
                  {format(addDays(safeStartDate, index), 'MMM d')}
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
                const dayDate = addDays(safeStartDate, DAYS.indexOf(day));
                const disabled = isFutureDate(dayDate);
                
                const fieldMap = {
                  'Start': 'startTime',
                  'End': 'endTime',
                  'Lunch Start': 'lunchStartTime',
                  'Lunch End': 'lunchEndTime',
                };
                
                const fieldName = fieldMap[label] as keyof TimeEntry;
                const hasError = hasFieldError(day, fieldName);
                const tooltipMessage = getFieldTooltipMessage(day, fieldName);
                
                return (
                  <View key={day} style={[
                    styles.cell,
                    // hasError && styles.errorCell, // Shows the outer red error box
                    disabled && styles.disabledCell
                  ]}>
                    <View style={styles.inputContainer}>
                      <TimeInput
                        value={formatTimeForDisplay(data.days[day][fieldName])}
                        onChange={(value) => handleTimeUpdate(day, fieldName, value)}
                        disabled={disabled}
                        onBlur={() => handleBlur(day)}
                        hasError={hasError}
                      />
                      {disabled && (
                        <View 
                          style={styles.lockIconContainer}
                          onMouseEnter={() => setHoveredLock(`${day}-${fieldName}`)}
                          onMouseLeave={() => setHoveredLock(null)}
                        >
                          {hoveredLock === `${day}-${fieldName}` && (
                            <Tooltip message="Cannot edit future dates" />
                          )}
                          <Ionicons name="lock-closed" size={16} color="#94a3b8" />
                        </View>
                      )}
                      {hasError && tooltipMessage && (
                        <View 
                          style={styles.errorIconContainer}
                          onMouseEnter={() => setHoveredError(`${day}-${fieldName}`)}
                          onMouseLeave={() => setHoveredError(null)}
                        >
                          {hoveredError === `${day}-${fieldName}` && (
                            <Tooltip message={tooltipMessage} />
                          )}
                          <Ionicons name="warning" size={16} color="#ef4444" />
                        </View>
                      )}
                    </View>
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
            {DAYS.map((day) => {
              const dayDate = addDays(safeStartDate, DAYS.indexOf(day));
              const disabled = isFutureDate(dayDate);
              return (
                <View key={day} style={[styles.cell, disabled && styles.disabledCell]}>
                  <View style={styles.inputContainer}>
                    <DayTypeSelect
                      value={data.days[day].dayType}
                      onChange={(type) => onDayTypeChange(day, type)}
                      disabled={disabled}
                    />
                    {disabled && (
                      <View 
                        style={styles.lockIconContainer}
                        onMouseEnter={() => setHoveredLock(`${day}-type`)}
                        onMouseLeave={() => setHoveredLock(null)}
                      >
                        {hoveredLock === `${day}-type` && (
                          <Tooltip message="Cannot edit future dates" />
                        )}
                        <Ionicons name="lock-closed" size={16} color="#94a3b8" />
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Total Hours Row */}
          <View style={styles.row}>
            <View style={[styles.labelCell, { backgroundColor: colors.inputBackground }]}>
              <ThemedText>Total Hours</ThemedText>
            </View>
            {DAYS.map((day) => {
              const hasError = hasFieldError(day, 'totalHours');
              const tooltipMessage = getFieldTooltipMessage(day, 'totalHours');
              
              return (
                <View key={day} style={[
                  styles.cell, 
                  { backgroundColor: colors.background.card },
                  hasError && styles.errorCell
                ]}>
                  <View style={styles.inputContainer}>
                    <ThemedText style={styles.totalHours}>
                      {(data.days[day].totalHours !== undefined && data.days[day].totalHours !== null) 
                        ? data.days[day].totalHours.toFixed(2) 
                        : '0.00'}
                    </ThemedText>
                    {hasError && tooltipMessage && (
                      <View 
                        style={styles.errorIconContainer}
                        onMouseEnter={() => setHoveredError(`${day}-totalHours`)}
                        onMouseLeave={() => setHoveredError(null)}
                      >
                        {hoveredError === `${day}-totalHours` && (
                          <Tooltip message={tooltipMessage} />
                        )}
                        <Ionicons name="warning" size={16} color="#ef4444" />
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
            <View style={[
              styles.cell, 
              { backgroundColor: colors.background.card },
              !validateWeeklyTotal().isValid && styles.errorCell
            ]}>
              <View style={styles.inputContainer}>
                <ThemedText style={[styles.totalHours, styles.weeklyTotal]}>
                  {weeklyTotal.toFixed(2)}
                </ThemedText>
                {!validateWeeklyTotal().isValid && validateWeeklyTotal().message && (
                  <View 
                    style={styles.errorIconContainer}
                    onMouseEnter={() => setHoveredError('weeklyTotal')}
                    onMouseLeave={() => setHoveredError(null)}
                  >
                    {hoveredError === 'weeklyTotal' && (
                      <Tooltip message={validateWeeklyTotal().message || ''} />
                    )}
                    <Ionicons name="warning" size={16} color="#ef4444" />
                  </View>
                )}
              </View>
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
    color: '#333333',
  },
  weeklyTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
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
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIconContainer: {
    position: 'absolute',
    right: -24,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  disabledCell: {
    backgroundColor: '#f1f5f9',
  },
  errorIconContainer: {
    position: 'absolute',
    right: -24,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
}); 