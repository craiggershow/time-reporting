import { TimeEntry } from '@/types/timesheet';

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

function timeToMinutes(timeStr: string): number {
  // Split time and period
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  // Convert to 24-hour format
  let totalMinutes = hours * 60 + minutes;
  
  if (period === 'PM' && hours !== 12) {
    totalMinutes += 12 * 60;
  } else if (period === 'AM' && hours === 12) {
    totalMinutes = minutes;
  }

  return totalMinutes;
}

export function validateTimeEntry(entry: TimeEntry): ValidationResult {
  if (!entry.startTime || !entry.endTime) return { isValid: true };

  // Convert times to minutes for easier comparison
  const startMinutes = timeToMinutes(entry.startTime);
  const endMinutes = timeToMinutes(entry.endTime);
  const sevenAM = 7 * 60;  // 420 minutes
  const eightPM = 20 * 60; // 1200 minutes

  console.log('Time validation:', {
    startTime: entry.startTime,
    endTime: entry.endTime,
    startMinutes,
    endMinutes,
    sevenAM,
    eightPM
  });

  // First check if end time is before start time
  if (endMinutes < startMinutes) {
    return {
      isValid: false,
      message: 'End time must be after start time'
    };
  }

  // Check start time is after 7am
  if (startMinutes < sevenAM) {
    return {
      isValid: false,
      message: 'Start time must be after 7:00 AM'
    };
  }

  // Check end time is before 8pm
  if (endMinutes > eightPM) {
    return {
      isValid: false,
      message: 'End time must be before 8:00 PM'
    };
  }

  // Check lunch times if both are present
  if (entry.lunchStartTime && entry.lunchEndTime) {
    const lunchStartMinutes = timeToMinutes(entry.lunchStartTime);
    const lunchEndMinutes = timeToMinutes(entry.lunchEndTime);

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