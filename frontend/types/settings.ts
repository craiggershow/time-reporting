export interface Settings {
  settings: {
    value: {
      payPeriodStartDate: Date;
      payPeriodLength: number;
      maxDailyHours: number;
      maxWeeklyHours: number;
      minLunchDuration: number;
      maxLunchDuration: number;
      overtimeThreshold: number;
      doubleTimeThreshold: number;
      holidays: Array<{
        date: Date;
        name: string;
        payRate: number;
      }>;
    };
  };
}

export interface TimesheetSettings {
  maxDailyHours: number;
  maxWeeklyHours: number;
  minLunchDuration: number;
  maxLunchDuration: number;
  overtimeThreshold: number;
  doubleTimeThreshold: number;
  minStartTime: number; // In minutes from midnight (e.g., 420 for 7:00 AM)
  maxEndTime: number;   // In minutes from midnight (e.g., 1200 for 8:00 PM)
  holidays: Array<{
    date: Date;
    name: string;
  }>;
}

// Default settings to use while loading or if fetch fails
export const DEFAULT_SETTINGS: TimesheetSettings = {
  maxDailyHours: 12,
  maxWeeklyHours: 44,
  minLunchDuration: 30,
  maxLunchDuration: 60,
  overtimeThreshold: 8,
  doubleTimeThreshold: 12,
  minStartTime: 420,  // 7:00 AM
  maxEndTime: 1200,   // 8:00 PM
  holidays: []
}; 