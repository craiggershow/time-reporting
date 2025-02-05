export type DayType = 'regular' | 'vacation' | 'sick' | 'holiday';

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
  week1: WeekData;
  week2: WeekData;
  vacationHours: number;
  totalHours: number;
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