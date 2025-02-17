// Let's create a type for our settings to ensure type safety
interface TimesheetSettings {
  // Pay Period Settings
  payPeriodStartDate: Date;
  payPeriodLength: number;

  // Time Validation Settings
  maxDailyHours: number;
  maxWeeklyHours: number;
  minLunchDuration: number;
  maxLunchDuration: number;
  
  // Overtime Settings
  overtimeThreshold: number;
  doubleTimeThreshold: number;

  // Time Entry Settings
  allowFutureTimeEntry: boolean;
  allowPastTimeEntry: boolean;
  pastTimeEntryLimit: number;
  
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
  
  // Holiday Settings
  holidayHoursDefault: number;
  holidayPayMultiplier: number;
} 