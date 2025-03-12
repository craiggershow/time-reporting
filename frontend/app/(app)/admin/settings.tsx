import React from 'react';
import { View, ScrollView, StyleSheet, Text, useWindowDimensions, TextInput, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, spacing, commonStyles } from '@/styles/common';
import { buildApiUrl } from '@/constants/Config';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Checkbox } from '@/components/ui/Checkbox';
import { HolidayManagementModal } from '@/components/admin/HolidayManagementModal';
import { convertTo12Hour, minutesToTime, timeToMinutes, convertTo24Hour } from '@/utils/timeUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MobileAdminNav } from '@/components/admin/MobileAdminNav';
import { Ionicons } from '@expo/vector-icons';

// Define Holiday interface to match the one in HolidayManagementModal
interface Holiday {
  date: Date;
  name: string;
  payRate: number;
}

interface Settings {
  payPeriodStartDate: Date | string;  // Allow both Date and string types
  payPeriodLength: number;

  maxDailyHours: number;
  maxWeeklyHours: number;
  minLunchDuration: number; // in minutes
  maxLunchDuration: number; // in minutes
  
  // Overtime Settings
  overtimeThreshold: number; // hours per week
  doubleTimeThreshold: number; // hours per week

  // Time Entry Settings
  allowFutureTimeEntry: boolean;
  allowPastTimeEntry: boolean;
  pastTimeEntryLimit: number; // in days
  
  // Notification Settings
  reminderDaysBefore: number;
  reminderDaysAfter: number;

  // Email Notification Settings
  enableEmailReminders: boolean;
  reminderEmailTemplate: string;
  ccAddresses: string[];
  
  // Approval Settings
  autoApprovalEnabled: boolean;
  autoApprovalMaxHours: number;
  requiredApprovers: number;
  approvalChain: {
    level: number;
    approverIds: string[];
  }[];
  
  // Holiday Settings
  holidays: Holiday[];
  holidayHoursDefault: number;
  holidayPayMultiplier: number;

  // Time Restrictions
  minStartTime: number; // In minutes from midnight (e.g., 420 for 7:00 AM)
  maxEndTime: number;   // In minutes from midnight (e.g., 1200 for 8:00 PM)
}

// Custom date input component to prevent auto-completion issues
const DateInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder = 'YYYY-MM-DD'
}: { 
  label: string; 
  value: string | Date; 
  onChange: (value: string) => void; 
  placeholder?: string;
}) => {
  // Convert value to string if it's a Date
  const initialValue = typeof value === 'string' 
    ? value 
    : `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  
  const [inputValue, setInputValue] = useState(initialValue);
  const [previousValue, setPreviousValue] = useState(initialValue);
  
  // Update local state when prop value changes
  useEffect(() => {
    if (typeof value === 'string') {
      setInputValue(value);
      setPreviousValue(value);
    } else if (value instanceof Date) {
      const dateStr = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
      setInputValue(dateStr);
      setPreviousValue(dateStr);
    }
  }, [value]);
  
  const handleTextChange = (text: string) => {
    // Store the previous value to detect backspacing
    setPreviousValue(inputValue);
    
    // Check if user is backspacing (current text is shorter than previous)
    const isBackspacing = text.length < inputValue.length;
    
    // Remove any non-numeric characters except hyphens
    let cleanedText = text.replace(/[^\d-]/g, '');
    
    // Handle backspacing specifically
    if (isBackspacing) {
      // If backspacing at a hyphen position (right after a hyphen)
      if (inputValue.endsWith('-') && text.length === inputValue.length - 1) {
        // Allow deleting the hyphen
        cleanedText = text;
      }
      // If backspacing would delete the last digit before a hyphen, also remove the hyphen
      else if (inputValue.includes('-') && 
              (inputValue.indexOf('-') === text.length || 
               inputValue.lastIndexOf('-') === text.length)) {
        // Remove the hyphen as well
        cleanedText = text.substring(0, text.length - 1);
      }
      
      setInputValue(cleanedText);
      
      // Only update parent state if it's a valid date format
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedText)) {
        onChange(cleanedText);
      } else if (cleanedText === '') {
        // Allow clearing the field completely
        onChange('');
      }
      return;
    }
    
    // Auto-format with hyphens for forward typing
    if (cleanedText.length > 0) {
      // Handle year part (first 4 digits)
      if (cleanedText.length < 4) {
        // Just keep the digits for the year
        setInputValue(cleanedText);
      } 
      // Auto-add hyphen after year when exactly 4 digits are entered
      else if (cleanedText.length === 4) {
        // Add hyphen after the year
        cleanedText = cleanedText + '-';
        setInputValue(cleanedText);
      }
      // Handle year-month part
      else if (cleanedText.length <= 7) {
        // Ensure there's a hyphen after the year if not already present
        if (cleanedText.length >= 5 && !cleanedText.includes('-')) {
          cleanedText = cleanedText.substring(0, 4) + '-' + cleanedText.substring(4);
        }
        
        // Auto-add hyphen after month if user has typed 2 digits for month
        if (cleanedText.length === 7 && cleanedText.indexOf('-') === 4 && cleanedText.lastIndexOf('-') === 4) {
          cleanedText = cleanedText + '-';
        }
        
        setInputValue(cleanedText);
      } 
      // Handle complete date
      else {
        // Ensure there's a hyphen after the month if not already present
        if (cleanedText.length >= 7 && 
            cleanedText.indexOf('-') === 4 && 
            cleanedText.lastIndexOf('-') === cleanedText.indexOf('-')) {
          cleanedText = cleanedText.substring(0, 7) + '-' + cleanedText.substring(7);
        }
        
        // Limit to 10 characters (YYYY-MM-DD)
        cleanedText = cleanedText.substring(0, 10);
        
        setInputValue(cleanedText);
      }
      
      // Only update parent state if it's a valid date format
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedText)) {
        onChange(cleanedText);
      }
    } else {
      setInputValue('');
      onChange('');
    }
  };
  
  return (
    <Input
      label={label}
      value={inputValue}
      onChangeText={handleTextChange}
      placeholder={placeholder}
      keyboardType="numeric"
      maxLength={10} // YYYY-MM-DD is 10 characters
    />
  );
};

export default function AdminSettings() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  
  const [settings, setSettings] = useState<Settings>({
    payPeriodStartDate: new Date(),
    payPeriodLength: 14,
    maxDailyHours: 2,
    maxWeeklyHours: 50,
    minLunchDuration: 30,
    maxLunchDuration: 60,
    overtimeThreshold: 40,
    doubleTimeThreshold: 60,
    allowFutureTimeEntry: true,
    allowPastTimeEntry: true,
    pastTimeEntryLimit: 14,
    reminderDaysBefore: 2,  // Add missing properties
    reminderDaysAfter: 2,   // Add missing properties
    enableEmailReminders: true,
    reminderEmailTemplate: 'Please submit your timesheet for the period ending {endDate}.',
    ccAddresses: [],
    autoApprovalEnabled: true,
    autoApprovalMaxHours: 40,
    requiredApprovers: 1,
    approvalChain: [],
    holidays: [],
    holidayHoursDefault: 6,
    holidayPayMultiplier: 1.5,
    minStartTime: 420,
    maxEndTime: 1200,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHolidayModal, setShowHolidayModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl('SETTINGS'), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      
      // Ensure payPeriodStartDate is properly formatted if it's a string with time component
      if (typeof data.payPeriodStartDate === 'string' && data.payPeriodStartDate.includes('T')) {
        // Extract just the date part (YYYY-MM-DD) from the ISO string
        data.payPeriodStartDate = data.payPeriodStartDate.split('T')[0];
      }
      
      setSettings(data);
    } catch (error) {
      console.error('Settings load error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Create a copy of settings to ensure we're sending the correct format
      const settingsToSave = { ...settings };
      
      // Ensure payPeriodStartDate is a string in YYYY-MM-DD format
      if (settingsToSave.payPeriodStartDate instanceof Date) {
        const date = settingsToSave.payPeriodStartDate;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        settingsToSave.payPeriodStartDate = `${year}-${month}-${day}`;
      } else if (typeof settingsToSave.payPeriodStartDate === 'string' && settingsToSave.payPeriodStartDate.includes('T')) {
        // Extract just the date part (YYYY-MM-DD) from the ISO string
        settingsToSave.payPeriodStartDate = settingsToSave.payPeriodStartDate.split('T')[0];
      }

      const response = await fetch(buildApiUrl('SETTINGS'), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsToSave),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleHolidayUpdate = (updatedHolidays: Holiday[]) => {
    setSettings(s => ({ ...s, holidays: updatedHolidays }));
  };

  const handleDateChange = (dateString: string) => {
    // Simply use the string directly - no conversion to Date and back
    console.log('Setting pay period start date as string:', dateString);
    setSettings(s => ({ ...s, payPeriodStartDate: dateString }));
  };

  // Convert string dates to Date objects for holidays when loading from API
  useEffect(() => {
    if (settings.holidays && settings.holidays.length > 0) {
      const processedHolidays = settings.holidays.map(holiday => {
        if (typeof holiday.date === 'string') {
          return {
            ...holiday,
            date: new Date(holiday.date)
          };
        }
        return holiday;
      });
      
      if (JSON.stringify(processedHolidays) !== JSON.stringify(settings.holidays)) {
        setSettings(s => ({ ...s, holidays: processedHolidays }));
      }
    }
  }, [settings.holidays]);

  if (isLoading) {
    return <LoadingSpinner message="Loading settings..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {isMobile ? (
        <>
          <View style={styles.mobileHeader}>
            <ThemedText type="title" style={styles.mobileHeaderTitle}>Settings</ThemedText>
          </View>
          
          <ScrollView style={styles.mobileContent}>
            <View style={styles.section}>
              <ThemedText type="subtitle">Pay Period Settings</ThemedText>
              <View style={styles.settingGroup}>
                <DateInput
                  label="Pay Period Start Date"
                  value={settings.payPeriodStartDate}
                  onChange={handleDateChange}
                />
                <Input
                  label="Pay Period Length (days)"
                  value={settings.payPeriodLength?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, payPeriodLength: parseInt(value) }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle">Time Validation Settings</ThemedText>
              <View style={styles.settingGroup}>
                <Input
                  label="Maximum Daily Hours"
                  value={settings.maxDailyHours?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, maxDailyHours: parseInt(value) || 15 }))}
                  keyboardType="numeric"
                />
                <Input
                  label="Maximum Weekly Hours"
                  value={settings.maxWeeklyHours?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, maxWeeklyHours: parseInt(value) || 50 }))}
                  keyboardType="numeric"
                />
                <Input
                  label="Minimum Lunch Duration (minutes)"
                  value={settings.minLunchDuration?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, minLunchDuration: parseInt(value) || 30 }))}
                  keyboardType="numeric"
                />
                <Input
                  label="Maximum Lunch Duration (minutes)"
                  value={settings.maxLunchDuration?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, maxLunchDuration: parseInt(value) || 60 }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle">Overtime Settings</ThemedText>
              <View style={styles.settingGroup}>
                <Input
                  label="Overtime Threshold (hours/week)"
                  value={settings.overtimeThreshold?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, overtimeThreshold: parseInt(value) || 40 }))}
                  keyboardType="numeric"
                />
                <Input
                  label="Double Time Threshold (hours/week)"
                  value={settings.doubleTimeThreshold?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, doubleTimeThreshold: parseInt(value) || 60 }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle">Email Notification Settings</ThemedText>
              <View style={styles.settingGroup}>
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    checked={settings.enableEmailReminders}
                    onValueChange={(value) => setSettings(s => ({ ...s, enableEmailReminders: value }))}
                    label="Enable Email Reminders"
                  />
                </View>
                <Input
                  label="Reminder Email Template"
                  value={settings.reminderEmailTemplate}
                  onChangeText={(value) => setSettings(s => ({ ...s, reminderEmailTemplate: value }))}
                  placeholder="Use {startDate} and {endDate} as placeholders"
                />
                <Input
                  label="CC Email Addresses (comma-separated)"
                  value={settings.ccAddresses?.join(', ') || ''}
                  onChangeText={(value) => setSettings(s => ({ 
                    ...s, 
                    ccAddresses: value.split(',').map(email => email.trim()).filter(Boolean)
                  }))}
                  placeholder="email1@example.com, email2@example.com"
                />
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle">Approval Settings</ThemedText>
              <View style={styles.settingGroup}>
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    checked={settings.autoApprovalEnabled}
                    onValueChange={(value) => setSettings(s => ({ ...s, autoApprovalEnabled: value }))}
                    label="Enable Auto-Approval"
                  />
                </View>
                <Input
                  label="Auto-Approval Maximum Hours"
                  value={settings.autoApprovalMaxHours?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, autoApprovalMaxHours: parseInt(value) || 40 }))}
                  keyboardType="numeric"
                  editable={settings.autoApprovalEnabled}
                />
                <Input
                  label="Required Approvers"
                  value={settings.requiredApprovers?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, requiredApprovers: parseInt(value) || 1 }))}
                  keyboardType="numeric"
                />
                <Button
                  onPress={() => {/* Open approval chain modal */}}
                  variant="secondary"
                >
                  <Text>Configure Approval Chain</Text>
                </Button>
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle">Holiday Settings</ThemedText>
              <View style={styles.settingGroup}>
                <Input
                  label="Default Holiday Hours"
                  value={settings.holidayHoursDefault?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, holidayHoursDefault: parseInt(value) || 8 }))}
                  keyboardType="numeric"
                />
                <Input
                  label="Holiday Pay Multiplier"
                  value={settings.holidayPayMultiplier?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, holidayPayMultiplier: parseFloat(value) || 1.5 }))}
                  keyboardType="decimal-pad"
                />
                <Button
                  onPress={() => setShowHolidayModal(true)}
                  variant="secondary"
                >
                  <Text>Manage Holidays ({settings.holidays?.length || 0})</Text>
                </Button>
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle">Time Restrictions</ThemedText>
              <View style={styles.inputGroup}>
                <Input
                  label="Earliest Start Time"
                  value={convertTo12Hour(minutesToTime(settings.minStartTime))}
                  onChangeText={(value) => {
                    // Only update if it's a valid 12-hour time
                    if (value.match(/^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/)) {
                      const minutes = timeToMinutes(value);
                      setSettings(s => ({ ...s, minStartTime: minutes }));
                    }
                  }}
                  placeholder="7:00 AM"
                />
                <Input
                  label="Latest End Time"
                  value={convertTo12Hour(minutesToTime(settings.maxEndTime))}
                  onChangeText={(value) => {
                    // Only update if it's a valid 12-hour time
                    if (value.match(/^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/)) {
                      const minutes = timeToMinutes(value);
                      setSettings(s => ({ ...s, maxEndTime: minutes }));
                    }
                  }}
                  placeholder="8:00 PM"
                />
              </View>
            </View>

            {error && <ErrorMessage message={error} />}

            <Button
              onPress={handleSave}
              disabled={isSaving}
              style={styles.saveButton}
            >
              <Text>{isSaving ? 'Saving...' : 'Save Settings'}</Text>
            </Button>
          </ScrollView>
          <MobileAdminNav />
        </>
      ) : (
        <>
          <Header />
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <ThemedText type="title">Pay Period Settings</ThemedText>
              <View style={styles.settingGroup}>
                <DateInput
                  label="Pay Period Start Date"
                  value={settings.payPeriodStartDate}
                  onChange={handleDateChange}
                />
                <Input
                  label="Pay Period Length (days)"
                  value={settings.payPeriodLength?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, payPeriodLength: parseInt(value) }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="title">Time Validation Settings</ThemedText>
              <View style={styles.settingGroup}>
                <Input
                  label="Maximum Daily Hours"
                  value={settings.maxDailyHours?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, maxDailyHours: parseInt(value) || 15 }))}
                  keyboardType="numeric"
                />
                <Input
                  label="Maximum Weekly Hours"
                  value={settings.maxWeeklyHours?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, maxWeeklyHours: parseInt(value) || 50 }))}
                  keyboardType="numeric"
                />
                <Input
                  label="Minimum Lunch Duration (minutes)"
                  value={settings.minLunchDuration?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, minLunchDuration: parseInt(value) || 30 }))}
                  keyboardType="numeric"
                />
                <Input
                  label="Maximum Lunch Duration (minutes)"
                  value={settings.maxLunchDuration?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, maxLunchDuration: parseInt(value) || 60 }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="title">Overtime Settings</ThemedText>
              <View style={styles.settingGroup}>
                <Input
                  label="Overtime Threshold (hours/week)"
                  value={settings.overtimeThreshold?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, overtimeThreshold: parseInt(value) || 40 }))}
                  keyboardType="numeric"
                />
                <Input
                  label="Double Time Threshold (hours/week)"
                  value={settings.doubleTimeThreshold?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, doubleTimeThreshold: parseInt(value) || 60 }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="title">Email Notification Settings</ThemedText>
              <View style={styles.settingGroup}>
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    checked={settings.enableEmailReminders}
                    onValueChange={(value) => setSettings(s => ({ ...s, enableEmailReminders: value }))}
                    label="Enable Email Reminders"
                  />
                </View>
                <Input
                  label="Reminder Email Template"
                  value={settings.reminderEmailTemplate}
                  onChangeText={(value) => setSettings(s => ({ ...s, reminderEmailTemplate: value }))}
                  placeholder="Use {startDate} and {endDate} as placeholders"
                />
                <Input
                  label="CC Email Addresses (comma-separated)"
                  value={settings.ccAddresses?.join(', ') || ''}
                  onChangeText={(value) => setSettings(s => ({ 
                    ...s, 
                    ccAddresses: value.split(',').map(email => email.trim()).filter(Boolean)
                  }))}
                  placeholder="email1@example.com, email2@example.com"
                />
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="title">Approval Settings</ThemedText>
              <View style={styles.settingGroup}>
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    checked={settings.autoApprovalEnabled}
                    onValueChange={(value) => setSettings(s => ({ ...s, autoApprovalEnabled: value }))}
                    label="Enable Auto-Approval"
                  />
                </View>
                <Input
                  label="Auto-Approval Maximum Hours"
                  value={settings.autoApprovalMaxHours?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, autoApprovalMaxHours: parseInt(value) || 40 }))}
                  keyboardType="numeric"
                  editable={settings.autoApprovalEnabled}
                />
                <Input
                  label="Required Approvers"
                  value={settings.requiredApprovers?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, requiredApprovers: parseInt(value) || 1 }))}
                  keyboardType="numeric"
                />
                <Button
                  onPress={() => {/* Open approval chain modal */}}
                  variant="secondary"
                >
                  <Text>Configure Approval Chain</Text>
                </Button>
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="title">Holiday Settings</ThemedText>
              <View style={styles.settingGroup}>
                <Input
                  label="Default Holiday Hours"
                  value={settings.holidayHoursDefault?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, holidayHoursDefault: parseInt(value) || 8 }))}
                  keyboardType="numeric"
                />
                <Input
                  label="Holiday Pay Multiplier"
                  value={settings.holidayPayMultiplier?.toString()}
                  onChangeText={(value) => setSettings(s => ({ ...s, holidayPayMultiplier: parseFloat(value) || 1.5 }))}
                  keyboardType="decimal-pad"
                />
                <Button
                  onPress={() => setShowHolidayModal(true)}
                  variant="secondary"
                >
                  <Text>Manage Holidays ({settings.holidays?.length || 0})</Text>
                </Button>
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Time Restrictions</ThemedText>
              <View style={styles.inputGroup}>
                <Input
                  label="Earliest Start Time"
                  value={convertTo12Hour(minutesToTime(settings.minStartTime))}
                  onChangeText={(value) => {
                    // Only update if it's a valid 12-hour time
                    if (value.match(/^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/)) {
                      const minutes = timeToMinutes(value);
                      setSettings(s => ({ ...s, minStartTime: minutes }));
                    }
                  }}
                  placeholder="7:00 AM"
                />
                <Input
                  label="Latest End Time"
                  value={convertTo12Hour(minutesToTime(settings.maxEndTime))}
                  onChangeText={(value) => {
                    // Only update if it's a valid 12-hour time
                    if (value.match(/^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/)) {
                      const minutes = timeToMinutes(value);
                      setSettings(s => ({ ...s, maxEndTime: minutes }));
                    }
                  }}
                  placeholder="8:00 PM"
                />
              </View>
            </View>

            {error && <ErrorMessage message={error} />}

            <Button
              onPress={handleSave}
              disabled={isSaving}
              style={styles.saveButton}
            >
              <Text>{isSaving ? 'Saving...' : 'Save Settings'}</Text>
            </Button>
          </ScrollView>
        </>
      )}

      {showHolidayModal && (
        <HolidayManagementModal
          holidays={settings.holidays}
          onClose={() => setShowHolidayModal(false)}
          onSave={handleHolidayUpdate}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.page,
  },
  content: {
    padding: spacing.lg,
  },
  mobileContent: {
    padding: spacing.md,
    paddingBottom: 70, // Add padding for the bottom navigation
  },
  mobileHeader: {
    backgroundColor: colors.background.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingGroup: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  saveButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  checkboxContainer: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  inputGroup: {
    gap: spacing.md,
  },
});