export function convertTo24Hour(time12h: string | null): string {
  if (!time12h) return "00:00";
  
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = modifier === 'PM' ? '12' : '00';
  } else {
    hours = modifier === 'PM' ? String(parseInt(hours, 10) + 12) : hours;
  }
  
  return `${hours.padStart(2, '0')}:${minutes}`;
}

export function convertTo12Hour(time24h: string): string {
  if (!time24h || time24h === "00:00") return "";
  
  const [hours24, minutes] = time24h.split(':');
  const hours = parseInt(hours24, 10);
  
  let period = hours >= 12 ? 'PM' : 'AM';
  let hours12 = hours % 12;
  hours12 = hours12 || 12; // Convert 0 to 12
  
  return `${hours12}:${minutes} ${period}`;
} 