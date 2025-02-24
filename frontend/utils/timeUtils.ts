// Convert 12-hour time string (hh:mm AM/PM) to minutes since midnight
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  
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

// Convert minutes since midnight to 24-hour time string (HH:mm)
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Convert 24-hour time string (HH:mm) to 12-hour time string (hh:mm AM/PM)
export function convertTo12Hour(time: string): string {
  if (!time) return '';
  
  const [hours, mins] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const twelveHour = hours % 12 || 12;
  return `${twelveHour}:${mins.toString().padStart(2, '0')} ${period}`;
}

// Convert 12-hour time string (hh:mm AM/PM) to 24-hour time string (HH:mm)
export function convertTo24Hour(time12h: string): string {
  if (!time12h) return '';
  
  const [timeStr, period] = time12h.split(' ');
  let [hours, minutes] = timeStr.split(':').map(Number);
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
} 