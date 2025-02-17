// Let's create a type for our settings to ensure type safety
export interface TimesheetSettings {
  // Company Info
  companyName: string;
  companyLogo?: string;

  // Pay Period Settings
  payPeriodStartDate: Date;
  payPeriodLength: number;

  // Time Entry Rules
  maxDailyHours: number;
  maxWeeklyHours: number;
  minLunchDuration: number;
  maxLunchDuration: number;
  
  // Overtime Settings
  overtimeThreshold: number;
  doubleTimeThreshold: number;
  
  // Holiday Settings
  holidayHoursDefault: number;
  holidayPayMultiplier: number;
  holidays: Holiday[];

  // Time Entry Restrictions
  allowFutureTimeEntry: boolean;
  allowPastTimeEntry: boolean;
  pastTimeEntryLimit: number;

  // Approval Settings
  autoApprovalEnabled: boolean;
  autoApprovalMaxHours: number;
  requiredApprovers: number;

  // Notification Settings
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  reminderDaysAfter: number;
  ccAddresses: string[];
  reminderEmailTemplate: string;
}

export interface Holiday {
  id?: string;
  date: Date;
  name: string;
  hoursDefault?: number;  // Optional override of holidayHoursDefault
  payMultiplier?: number; // Optional override of holidayPayMultiplier
}

export interface Settings {
  key: string;
  value: string | TimesheetSettings;
} 