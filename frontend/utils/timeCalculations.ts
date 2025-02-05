import { TimeEntry } from '../types/timesheet';

function convertTo24Hour(time: string): number {
  const [timeStr, period] = time.split(' ');
  let [hours, minutes] = timeStr.split(':').map(Number);
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
}

export function calculateTotalHours(entry: TimeEntry): number {
  if (!entry.startTime || !entry.endTime) return 0;

  const startMinutes = convertTo24Hour(entry.startTime);
  const endMinutes = convertTo24Hour(entry.endTime);
  
  let totalMinutes = endMinutes - startMinutes;
  
  // Handle crossing midnight
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
  }

  // Subtract lunch time if present
  if (entry.lunchStartTime && entry.lunchEndTime) {
    const lunchStartMinutes = convertTo24Hour(entry.lunchStartTime);
    const lunchEndMinutes = convertTo24Hour(entry.lunchEndTime);
    
    const lunchMinutes = lunchEndMinutes - lunchStartMinutes;
    totalMinutes -= lunchMinutes;
  }

  return Math.max(0, totalMinutes / 60);
} 