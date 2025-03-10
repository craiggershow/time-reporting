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

  // Validate times not entered when type is not REGULAR
  if (entry.dayType !== 'REGULAR') {
    if (entry.startTime || entry.endTime || entry.lunchStartTime || entry.lunchEndTime) {
      return { isValid: false, message: 'Regular day type required when times are entered' };
    } else {
      return { isValid: true };
    }
  } else {
    console.log('⚙️ Regular day type, proceeding with validation');
  }
  
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

  // Skip validation if no times are entered
  if (!entry.startTime || !entry.endTime) {
    return { isValid: true };
  }

  // Extract settings values if available
  const maxEndTime = settings?.maxEndTime;
  const minStartTime = settings?.minStartTime;
  const maxDailyHours = settings?.maxDailyHours;
  
  console.log('⚙️ Extracted settings for validation:', { 
    maxEndTime, 
    minStartTime, 
    maxDailyHours 
  });

  // Convert times to minutes for comparison
  const startMinutes = timeToMinutes(entry.startTime);
  const endMinutes = timeToMinutes(entry.endTime);

  // Check if start time is before minimum start time (if defined)
  if (minStartTime !== undefined && startMinutes < minStartTime) {
    const formattedMinStartTime = convertTo12Hour(minutesToTime(minStartTime));
    return {
      isValid: false,
      message: `Start time cannot be earlier than ${formattedMinStartTime}`
    };
  }

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

  // Check total hours against max daily hours
  if (maxDailyHours !== undefined && entry.totalHours > maxDailyHours) {
    return {
      isValid: false,
      message: `Daily hours cannot exceed ${maxDailyHours} hours`
    };
  }

  console.log('⚙️ validateTimeEntry found no errors returning true');
  return { isValid: true };
}

export function validateWeeklyHours(weekTotal: number, settings?: any): ValidationResult {
  console.log('⚙️ validateWeeklyHours called with weekTotal:', weekTotal, 'settings:', settings);
  
  if (!settings) {
    console.log('⚙️ No settings provided to validateWeeklyHours, skipping validation');
    return { isValid: true };
  }

  // Extract maxWeeklyHours from settings
  const maxWeeklyHours = settings?.maxWeeklyHours;
  console.log('⚙️ Extracted maxWeeklyHours for validation:', maxWeeklyHours);

  if (maxWeeklyHours !== undefined && weekTotal > maxWeeklyHours) {
    return {
      isValid: false,
      message: `Weekly hours must not exceed ${maxWeeklyHours}`
    };
  }

  return { isValid: true };
} 