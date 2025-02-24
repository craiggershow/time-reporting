// Helper to create date without timezone issues
function createLocalDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

export const DEFAULT_TIMESHEET_SETTINGS = {
  // Company Info
  companyName: 'KV Dental',
  companyLogo: '/path/to/logo.png',

  // Pay Period Settings
  payPeriodStartDate: createLocalDate(2024, 1, 1),
  payPeriodLength: 14,

  // Time Entry Rules
  maxDailyHours: 15,
  maxWeeklyHours: 50,
  minLunchDuration: 30,
  maxLunchDuration: 60,

  // Time Restrictions
  minStartTime: 420, // In minutes from midnight (e.g., 420 for 7:00 AM)
  maxEndTime: 1200,   // In minutes from midnight (e.g., 1200 for 8:00 PM)

  // Overtime Settings
  overtimeThreshold: 40,
  doubleTimeThreshold: 60,

  // Holiday Settings
  holidayHoursDefault: 8,
  holidayPayMultiplier: 1.5,
  holidays: [],

  // Time Entry Restrictions
  allowFutureTimeEntry: false,
  allowPastTimeEntry: true,
  pastTimeEntryLimit: 14,

  // Approval Settings
  autoApprovalEnabled: false,
  autoApprovalMaxHours: 40,
  requiredApprovers: 1,

  // Notification Settings
  reminderEnabled: true,
  reminderDaysBefore: 2,
  reminderDaysAfter: 1,
  ccAddresses: [],
  reminderEmailTemplate: 'Please submit your timesheet for the period ending {endDate}.'
};

export const DEFAULT_HOLIDAYS = [
  { date: createLocalDate(2024, 1, 1), name: 'New Year\'s Day' },
  { date: createLocalDate(2024, 2, 19), name: 'Family Day' },
  { date: createLocalDate(2024, 3, 29), name: 'Good Friday' },
  { date: createLocalDate(2024, 5, 20), name: 'Victoria Day' },
  { date: createLocalDate(2024, 7, 1), name: 'Canada Day' },
  { date: createLocalDate(2024, 8, 5), name: 'Civic Holiday' },
  { date: createLocalDate(2024, 9, 2), name: 'Labour Day' },
  { date: createLocalDate(2024, 10, 14), name: 'Thanksgiving' },
  { date: createLocalDate(2024, 12, 25), name: 'Christmas Day' },
  { date: createLocalDate(2024, 12, 26), name: 'Boxing Day' }
]; 