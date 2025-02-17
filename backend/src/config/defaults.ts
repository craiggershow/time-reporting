export const DEFAULT_TIMESHEET_SETTINGS = {
  // Company Info
  companyName: 'KV Dental',
  companyLogo: '/path/to/logo.png',

  // Pay Period Settings
  payPeriodStartDate: new Date('2024-01-01'),
  payPeriodLength: 14,

  // Time Entry Rules
  maxDailyHours: 12,
  maxWeeklyHours: 44,
  minLunchDuration: 30,
  maxLunchDuration: 120,

  // Overtime Settings
  overtimeThreshold: 8,
  doubleTimeThreshold: 12,

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
  { date: new Date('2024-01-01'), name: 'New Year\'s Day' },
  { date: new Date('2024-02-19'), name: 'Family Day' },
  { date: new Date('2024-03-29'), name: 'Good Friday' },
  { date: new Date('2024-05-20'), name: 'Victoria Day' },
  { date: new Date('2024-07-01'), name: 'Canada Day' },
  { date: new Date('2024-08-05'), name: 'Civic Holiday' },
  { date: new Date('2024-09-02'), name: 'Labour Day' },
  { date: new Date('2024-10-14'), name: 'Thanksgiving' },
  { date: new Date('2024-12-25'), name: 'Christmas Day' },
  { date: new Date('2024-12-26'), name: 'Boxing Day' }
]; 