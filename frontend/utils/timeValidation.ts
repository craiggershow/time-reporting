import { TimeEntry } from '@/types/timesheet';
import { timeToMinutes, minutesToTime, convertTo12Hour } from './timeUtils';
import { TimesheetSettings } from '@/types/settings';

interface ValidationResult {
  isValid: boolean;
  messages?: string[];
  message?: string; // For backward compatibility
}


export function validateTimeEntry(entry: TimeEntry, settings?: any): ValidationResult {
  console.log('⚙️ validateTimeEntry called with settings:', settings);
  console.log('⚙️ validateTimeEntry entry:', entry);
  
  const errors: string[] = [];
  
  // Check for incomplete pairs
  if (entry.startTime && !entry.endTime) {
    errors.push('End time is required when start time is entered');
  }

  if (entry.endTime && !entry.startTime) {
    errors.push('Start time is required when end time is entered');
  }

  if (entry.lunchStartTime && !entry.lunchEndTime) {
    errors.push('Lunch end time is required when lunch start time is entered');
  }

  if (entry.lunchEndTime && !entry.lunchStartTime) {
    errors.push('Lunch start time is required when lunch start time is entered');
  }

  // Skip further validation for non-regular day types
  if (entry.dayType !== 'REGULAR') {
    return { isValid: errors.length === 0, messages: errors, message: errors[0] };
  }

  // Skip validation if no times are entered
  if (!entry.startTime || !entry.endTime) {
    return { isValid: errors.length === 0, messages: errors, message: errors[0] };
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
    errors.push(`Start time cannot be earlier than ${formattedMinStartTime}`);
  }

  // Check if end time is after start time
  if (endMinutes <= startMinutes) {
    errors.push('End time must be after start time');
  }

  // Check if end time exceeds max end time (if defined)
  if (maxEndTime !== undefined && endMinutes > maxEndTime) {
    const formattedMaxEndTime = convertTo12Hour(minutesToTime(maxEndTime));
    errors.push(`End time cannot be later than ${formattedMaxEndTime}`);
  }

  // Check lunch times if both are entered
  if (entry.lunchStartTime && entry.lunchEndTime) {
    const lunchStartMinutes = timeToMinutes(entry.lunchStartTime);
    const lunchEndMinutes = timeToMinutes(entry.lunchEndTime);

    // Check if lunch start is after work start
    if (lunchStartMinutes < startMinutes) {
      errors.push('Lunch start time must be after work start time');
    }

    // Check if lunch end is before work end
    if (lunchEndMinutes > endMinutes) {
      errors.push('Lunch end time must be before work end time');
    }

    // Check if lunch end is after lunch start
    if (lunchEndMinutes <= lunchStartMinutes) {
      errors.push('Lunch end time must be after lunch start time');
    }
  }

  // Check total hours against max daily hours
  if (maxDailyHours !== undefined && entry.totalHours > maxDailyHours) {
    errors.push(`Daily hours cannot exceed ${maxDailyHours} hours`);
  }

  return { 
    isValid: errors.length === 0, 
    messages: errors,
    message: errors.length > 0 ? errors[0] : undefined // For backward compatibility
  };
}

export function validateWeeklyHours(weekTotal: number, settings?: any): ValidationResult {
  console.log('⚙️ validateWeeklyHours called with weekTotal:', weekTotal, 'settings:', settings);
  
  const errors: string[] = [];
  
  if (!settings) {
    console.log('⚙️ No settings provided to validateWeeklyHours, skipping validation');
    return { isValid: true, messages: [] };
  }

  // Extract maxWeeklyHours from settings
  const maxWeeklyHours = settings?.maxWeeklyHours;
  console.log('⚙️ Extracted maxWeeklyHours for validation:', maxWeeklyHours);

  if (maxWeeklyHours !== undefined && weekTotal > maxWeeklyHours) {
    errors.push(`Weekly hours must not exceed ${maxWeeklyHours}`);
  }

  return { 
    isValid: errors.length === 0, 
    messages: errors,
    message: errors.length > 0 ? errors[0] : undefined // For backward compatibility
  };
} 