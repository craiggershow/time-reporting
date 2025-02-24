export type DayType = 'REGULAR' | 'VACATION' | 'SICK' | 'HOLIDAY';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';

export interface TimeEntry {
  startTime: string | null;
  endTime: string | null;
  lunchStartTime: string | null;
  lunchEndTime: string | null;
  dayType: DayType;
  totalHours: number;
}

export interface WeekData {
  monday: TimeEntry;
  tuesday: TimeEntry;
  wednesday: TimeEntry;
  thursday: TimeEntry;
  friday: TimeEntry;
  extraHours: number;
  totalHours: number;
}

export interface TimesheetData {
  startDate: Date;
  endDate: Date;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submittedAt?: Date;
  week1: WeekData;
  week2: WeekData;
  vacationHours: number;
}

export interface TimesheetResponse {
  id: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  payPeriod: {
    startDate: string;
    endDate: string;
  };
  weeks: {
    weekNumber: number;
    data: WeekData;
  }[];
  vacationHours: number;
  totalHours: number;
}

export interface PayPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
}

export interface Timesheet {
  id: string;
  userId: string;
  payPeriodId: string;
  payPeriod: PayPeriod;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  weeks: Week[];
  vacationHours: number;
  submittedAt?: Date;
}

export interface Week {
  id: string;
  weekNumber: number;
  timesheetId: string;
  extraHours: number;
  days: Day[];
}

export interface Day {
  id: string;
  weekId: string;
  dayOfWeek: DayOfWeek;
  dayType: DayType;
  startTime: string | null;
  endTime: string | null;
  lunchStartTime: string | null;
  lunchEndTime: string | null;
  totalHours: number;
} 