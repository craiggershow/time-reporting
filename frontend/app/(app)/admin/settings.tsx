import { View, ScrollView, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DateTimePicker } from '@/components/DateTimePicker';
import { colors, spacing } from '@/styles/common';
import { buildApiUrl } from '@/constants/Config';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Checkbox } from '@/components/ui/Checkbox';
import { HolidayManagementModal } from '@/components/admin/HolidayManagementModal';

interface Settings {
  // Pay Period Settings
  payPeriodStartDate: Date;
  payPeriodLength: number; // in days, typically 14

  // Time Validation Settings
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
  holidays: {
    date: Date;
    name: string;
    payRate: number;
  }[];
  holidayHoursDefault: number;
  holidayPayMultiplier: number;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    payPeriodStartDate: new Date(),
    payPeriodLength: 14,
    maxDailyHours: 15,
    maxWeeklyHours: 50,
    minLunchDuration: 30,
    maxLunchDuration: 60,
    overtimeThreshold: 40,
    doubleTimeThreshold: 60,
    allowFutureTimeEntry: false,
    allowPastTimeEntry: true,
    pastTimeEntryLimit: 14,
    reminderDaysBefore: 2,
    reminderDaysAfter: 1,

    // Email Notification Settings
    enableEmailReminders: true,
    reminderEmailTemplate: 'Your timesheet for the period {startDate} to {endDate} is due.',
    ccAddresses: [],
    
    // Approval Settings
    autoApprovalEnabled: false,
    autoApprovalMaxHours: 40,
    requiredApprovers: 1,
    approvalChain: [],
    
    // Holiday Settings
    holidays: [],
    holidayHoursDefault: 8,
    holidayPayMultiplier: 1.5,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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
        throw new Error('Failed to load settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (error) {
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

      // Show success message
      // You might want to add a success notification here
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleHolidayUpdate = (updatedHolidays: Settings['holidays']) => {
    setSettings(s => ({ ...s, holidays: updatedHolidays }));
  };

  const handleDateChange = (date: Date) => {
    // Ensure we're working with a clean date object without time components
    const cleanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setSettings(s => ({ ...s, payPeriodStartDate: cleanDate }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <ThemedText type="title">Pay Period Settings</ThemedText>
          <View style={styles.settingGroup}>
            <DateTimePicker
              label="Pay Period Start Date"
              value={new Date(settings.payPeriodStartDate)}
              onChange={handleDateChange}
            />
            <Input
              label="Pay Period Length (days)"
              value={settings.payPeriodLength.toString()}
              onChangeText={(value) => setSettings(s => ({ ...s, payPeriodLength: parseInt(value) || 14 }))}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="title">Time Validation Settings</ThemedText>
          <View style={styles.settingGroup}>
            <Input
              label="Maximum Daily Hours"
              value={settings.maxDailyHours.toString()}
              onChangeText={(value) => setSettings(s => ({ ...s, maxDailyHours: parseInt(value) || 15 }))}
              keyboardType="numeric"
            />
            <Input
              label="Maximum Weekly Hours"
              value={settings.maxWeeklyHours.toString()}
              onChangeText={(value) => setSettings(s => ({ ...s, maxWeeklyHours: parseInt(value) || 50 }))}
              keyboardType="numeric"
            />
            <Input
              label="Minimum Lunch Duration (minutes)"
              value={settings.minLunchDuration.toString()}
              onChangeText={(value) => setSettings(s => ({ ...s, minLunchDuration: parseInt(value) || 30 }))}
              keyboardType="numeric"
            />
            <Input
              label="Maximum Lunch Duration (minutes)"
              value={settings.maxLunchDuration.toString()}
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
              value={settings.overtimeThreshold.toString()}
              onChangeText={(value) => setSettings(s => ({ ...s, overtimeThreshold: parseInt(value) || 40 }))}
              keyboardType="numeric"
            />
            <Input
              label="Double Time Threshold (hours/week)"
              value={settings.doubleTimeThreshold.toString()}
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
              multiline
              numberOfLines={3}
              placeholder="Use {startDate} and {endDate} as placeholders"
            />
            <Input
              label="CC Email Addresses (comma-separated)"
              value={settings.ccAddresses.join(', ')}
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
              value={settings.autoApprovalMaxHours.toString()}
              onChangeText={(value) => setSettings(s => ({ ...s, autoApprovalMaxHours: parseInt(value) || 40 }))}
              keyboardType="numeric"
              disabled={!settings.autoApprovalEnabled}
            />
            <Input
              label="Required Approvers"
              value={settings.requiredApprovers.toString()}
              onChangeText={(value) => setSettings(s => ({ ...s, requiredApprovers: parseInt(value) || 1 }))}
              keyboardType="numeric"
            />
            <Button
              onPress={() => {/* Open approval chain modal */}}
              variant="secondary"
            >
              Configure Approval Chain
            </Button>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="title">Holiday Settings</ThemedText>
          <View style={styles.settingGroup}>
            <Input
              label="Default Holiday Hours"
              value={settings.holidayHoursDefault.toString()}
              onChangeText={(value) => setSettings(s => ({ ...s, holidayHoursDefault: parseInt(value) || 8 }))}
              keyboardType="numeric"
            />
            <Input
              label="Holiday Pay Multiplier"
              value={settings.holidayPayMultiplier.toString()}
              onChangeText={(value) => setSettings(s => ({ ...s, holidayPayMultiplier: parseFloat(value) || 1.5 }))}
              keyboardType="decimal-pad"
            />
            <Button
              onPress={() => setShowHolidayModal(true)}
              variant="secondary"
            >
              Manage Holidays ({settings.holidays.length})
            </Button>
          </View>
        </View>

        {error && <ErrorMessage message={error} />}

        <Button
          onPress={handleSave}
          disabled={isSaving}
          style={styles.saveButton}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </ScrollView>

      {showHolidayModal && (
        <HolidayManagementModal
          holidays={settings.holidays}
          onClose={() => setShowHolidayModal(false)}
          onSave={handleHolidayUpdate}
        />
      )}
    </View>
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
}); 