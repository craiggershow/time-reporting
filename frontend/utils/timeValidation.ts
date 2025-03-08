import { TimeEntry } from '@/types/timesheet';
import { timeToMinutes, minutesToTime, convertTo12Hour } from './timeUtils';
import { TimesheetSettings } from '@/types/settings';

interface ValidationResult {
  isValid: boolean;
  message?: string;
}


export function validateTimeEntry(entry: TimeEntry, settings?: any): ValidationResult {
  //console.log('⚙️ validateTimeEntry called with settings:', settings);
  //console.log('⚙️ validateTimeEntry settings type:', typeof settings);
  //console.log('⚙️ validateTimeEntry settings keys:', settings ? Object.keys(settings) : 'null');
  //console.log('⚙️ validateTimeEntry settings stringified:', settings ? JSON.stringify(settings) : 'null');
  //console.log('⚙️ validateTimeEntry entry:', entry);
  
  // Check for incomplete pairs
  if (entry.startTime && !entry.endTime) {
    return {
      isValid: false,
      message: 'End time is required when start time is entered'
    };
  }

  if (entry.endTime && !entry.startTime) {
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

  if (entry.lunchEndTime && !entry.lunchStartTime) {
    return {
      isValid: false,
      message: 'Lunch start time is required when lunch end time is entered'
    };
  }

  // Skip further validation for non-regular day types
  if (entry.dayType !== 'REGULAR') {
    return { isValid: true };
  }

  // Skip validation if no times are entered
  if (!entry.startTime || !entry.endTime) {
    return { isValid: true };
  }

  // Extract maxEndTime from settings if available
  let maxEndTime: number | undefined;
  if (settings) {
    // Try different paths to find maxEndTime
    if (settings.maxEndTime !== undefined) {
      maxEndTime = settings.maxEndTime;
    } else if (settings.settings?.value?.maxEndTime !== undefined) {
      maxEndTime = settings.settings.value.maxEndTime;
    }
    console.log('⚙️ Extracted maxEndTime for validation:', maxEndTime);
  } else {
    console.log('⚙️ No settings provided to validateTimeEntry, skipping maxEndTime validation');
  }

  // Convert times to minutes for comparison
  const startMinutes = timeToMinutes(entry.startTime);
  const endMinutes = timeToMinutes(entry.endTime);

  // Check if end time is after start time
  if (endMinutes <= startMinutes) {
    return {
      isValid: false,
      message: 'End time must be after start time'
    };
  }

  // Check if end time exceeds max end time (if defined)
  if (maxEndTime !== undefined && endMinutes > maxEndTime) {
    const formattedMaxEndTime = convertTo12Hour(minutesToTime(maxEndTime));
    return {
      isValid: false,
      message: `End time cannot be later than ${formattedMaxEndTime}`
    };
  }

  // Check lunch times if both are entered
  if (entry.lunchStartTime && entry.lunchEndTime) {
    const lunchStartMinutes = timeToMinutes(entry.lunchStartTime);
    const lunchEndMinutes = timeToMinutes(entry.lunchEndTime);

    // Check if lunch start is after work start
    if (lunchStartMinutes < startMinutes) {
      return {
        isValid: false,
        message: 'Lunch start time must be after work start time'
      };
    }

    // Check if lunch end is before work end
    if (lunchEndMinutes > endMinutes) {
      return {
        isValid: false,
        message: 'Lunch end time must be before work end time'
      };
    }

    // Check if lunch end is after lunch start
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

export function validateWeeklyHours(weekTotal: number, settings?: any): ValidationResult {
  console.log('⚙️ validateWeeklyHours called with weekTotal:', weekTotal, 'settings:', settings);
  
  if (!settings) {
    console.log('⚙️ No settings provided to validateWeeklyHours, skipping validation');
    return { isValid: true };
  }

  // Extract maxWeeklyHours from settings if available
  let maxWeeklyHours: number | undefined;
  if (settings.maxWeeklyHours !== undefined) {
    maxWeeklyHours = settings.maxWeeklyHours;
  } else if (settings.settings?.value?.maxWeeklyHours !== undefined) {
    maxWeeklyHours = settings.settings.value.maxWeeklyHours;
  }
  console.log('⚙️ Extracted maxWeeklyHours for validation:', maxWeeklyHours);

  if (maxWeeklyHours !== undefined && weekTotal > maxWeeklyHours) {
    return {
      isValid: false,
      message: `Weekly hours must not exceed ${maxWeeklyHours}`
    };
  }

  return { isValid: true };
} 