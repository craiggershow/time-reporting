import { TimeEntry } from '../types/timesheet';

export function timeToMinutes(time: string): number {
  if (!time) return 0;
  
  const [timeStr, period] = time.split(' ');
  let [hours, minutes] = timeStr.split(':').map(Number);
  
  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
}

export function calculateTotalRegularHours(entry: TimeEntry): number {
  if (!entry.startTime || !entry.endTime) return 0;

  const startMinutes = timeToMinutes(entry.startTime);
  const endMinutes = timeToMinutes(entry.endTime);
  
  let totalMinutes = endMinutes - startMinutes;
  
  // Don't wrap around midnight - if end is before start, return negative hours
  if (totalMinutes < 0) {
    // Keep the negative value instead of adding 24 hours
    if (entry.lunchStartTime && entry.lunchEndTime) {
      const lunchStartMinutes = timeToMinutes(entry.lunchStartTime);
      const lunchEndMinutes = timeToMinutes(entry.lunchEndTime);
      totalMinutes -= (lunchEndMinutes - lunchStartMinutes);
    }
    return totalMinutes / 60;
  }

  // Subtract lunch time if present
  if (entry.lunchStartTime && entry.lunchEndTime) {
    const lunchStartMinutes = timeToMinutes(entry.lunchStartTime);
    const lunchEndMinutes = timeToMinutes(entry.lunchEndTime);
    totalMinutes -= (lunchEndMinutes - lunchStartMinutes);
  }

  return totalMinutes / 60;
} 