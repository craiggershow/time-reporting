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

  const startMinutes = timeToMinutes(entry.startTime);
  const endMinutes = timeToMinutes(entry.endTime);
  const sevenAM = 7 * 60;  // 420 minutes
  const eightPM = 20 * 60; // 1200 minutes

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