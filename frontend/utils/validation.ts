import { formatTimeForDisplay } from '@/utils/time';

export function validateTimes(startTime: string, endTime: string): string | null {
  // Do validation in 24-hour format
  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    // Convert times to 12-hour format for error message
    return `End time (${formatTimeForDisplay(endTime)}) must be after start time (${formatTimeForDisplay(startTime)})`;
  }
  return null;
} 