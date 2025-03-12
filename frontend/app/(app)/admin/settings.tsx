import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DateTimePicker } from '@/components/DateTimePicker';
import { colors, spacing, commonStyles } from '@/styles/common';
import { buildApiUrl } from '@/constants/Config';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Checkbox } from '@/components/ui/Checkbox';
import { HolidayManagementModal } from '@/components/admin/HolidayManagementModal';
import { convertTo12Hour, minutesToTime, timeToMinutes, convertTo24Hour } from '@/utils/timeUtils';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function AdminSettings() {
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

      const response = await fetch(buildApiUrl('SETTINGS'), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
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

  const handleDateChange = (date: Date | string) => {
    // Ensure we're working with a Date object first
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // If it's already a string, parse it to a Date
      const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
      dateObj = new Date(year, month - 1, day);
    } else {
      dateObj = date;
    }
    
    // Use UTC methods to avoid timezone adjustments
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    console.log('Setting pay period start date as string (UTC):', dateString);
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
      <Header />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <ThemedText type="title">Pay Period Settings</ThemedText>
          <View style={styles.settingGroup}>
            <DateTimePicker
              label="Pay Period Start Date"
              value={settings.payPeriodStartDate instanceof Date ? settings.payPeriodStartDate : new Date(settings.payPeriodStartDate)}
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
  section: {
    marginBottom: spacing.xl,
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