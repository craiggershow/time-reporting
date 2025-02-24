import { TimeEntry } from '@/types/timesheet';
import { timeToMinutes } from './timeUtils';
import { TimesheetSettings } from '@/types/settings';

interface ValidationResult {
  isValid: boolean;
  message?: string;
}


export function validateTimeEntry(entry: TimeEntry, settings: TimesheetSettings): ValidationResult {
  // Check for incomplete pairs
  if (entry.startTime && !entry.endTime) {
    return {
      isValid: false,
      message: 'End time is required when start time is entered'
    };
  }

  if (!entry.startTime && entry.endTime) {
    return {
      isValid: false,
      message: 'Start time is required when end time is entered'
    };
  }

  if (entry.lunchStartTime && !entry.lunchEndTime) {
    return {
      isValid: false,
      message: 'Lunch end time is required when lunch start time is entered'
    };
  }

  if (!entry.lunchStartTime && entry.lunchEndTime) {
    return {
      isValid: false,
      message: 'Lunch start time is required when lunch end time is entered'
    };
  }

  // If no times are entered at all, consider it valid
  if (!entry.startTime && !entry.endTime && !entry.lunchStartTime && !entry.lunchEndTime) {
    return { isValid: true };
  }

  // Only validate times if they exist
  if (entry.startTime && entry.endTime) {
    const startMinutes = timeToMinutes(entry.startTime);
    const endMinutes = timeToMinutes(entry.endTime);

    // Check start time is after minimum
    if (startMinutes < settings.minStartTime) {
      return {
        isValid: false,
        message: `Start time must be after ${convertTo12Hour(minutesToTime(settings.minStartTime))}`
      };
    }

    // Check end time is before maximum
    if (endMinutes > settings.maxEndTime) {
      return {
        isValid: false,
        message: `End time must be before ${convertTo12Hour(minutesToTime(settings.maxEndTime))}`
      };
    }
  }

  // Check lunch times if both are present
  if (entry.lunchStartTime && entry.lunchEndTime) {
    const lunchStartMinutes = timeToMinutes(entry.lunchStartTime);
    const lunchEndMinutes = timeToMinutes(entry.lunchEndTime);

    // Check lunch start time constraints
    if (lunchStartMinutes < startMinutes) {
      return {
        isValid: false,
        message: 'Lunch start time must be after start time'
      };
    }

    if (lunchStartMinutes > endMinutes) {
      return {
        isValid: false,
        message: 'Lunch start time must be before end time'
      };
    }

    // Check lunch end time constraints
    if (lunchEndMinutes < startMinutes) {
      return {
        isValid: false,
        message: 'Lunch end time must be after start time'
      };
    }

    if (lunchEndMinutes > endMinutes) {
      return {
        isValid: false,
        message: 'Lunch end time must be before end time'
      };
    }

    // Check lunch end is after lunch start
    if (lunchEndMinutes <= lunchStartMinutes) {
      return {
        isValid: false,
        message: 'Lunch end time must be after lunch start time'
      };
    }
  }

  // Check total hours
  if (entry.totalHours > 15) {
    return {
      isValid: false,
      message: 'Total hours cannot exceed 15 hours per day'
    };
  }

  return { isValid: true };
}

export function validateWeeklyHours(weekTotal: number): ValidationResult {
  if (weekTotal > 50) {
    return {
      isValid: false,
      message: 'Total hours cannot exceed 50 hours per week'
    };
  }
  return { isValid: true };
} 