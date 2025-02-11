// For internal use and API communication - always 24-hour format
export function convertTo24Hour(time12h: string | null): string {
  if (!time12h) return "00:00";
  
  // Normalize input by removing spaces and converting to lowercase
  const input = time12h.toLowerCase().replace(/\s+/g, '');
  
  // Extract hours, minutes, and period using regex
  const timeRegex = /^(\d{1,2})(?::?(\d{2}))?(a|am|p|pm)?$/;
  const match = input.match(timeRegex);
  
  if (!match) return "00:00";
  
  let [_, hours, minutes, period] = match;
  
  // Convert hours to number
  let hoursNum = parseInt(hours, 10);
  
  // Default minutes to "00" if not provided
  minutes = minutes || "00";
  
  // Default period to "am" if not provided
  period = period || "a";
  
  // Normalize period to "am" or "pm"
  period = period === "a" || period === "am" ? "am" : "pm";
  
  // Handle special cases for 12 AM/PM
  if (hoursNum === 12) {
    hoursNum = period === "am" ? 0 : 12;
  } else if (period === "pm" && hoursNum < 12) {
    hoursNum += 12;
  }
  
  // Format output
  return `${hoursNum.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

// For UI display only - converts 24-hour to 12-hour format
export function convertTo12Hour(time24h: string): string {
  if (!time24h || time24h === "00:00") return "";
  
  const [hours24, minutes] = time24h.split(':');
  const hours = parseInt(hours24, 10);
  
  // Special handling for noon and midnight
  if (hours === 0) {
    return `12:${minutes} AM`; // Midnight
  } else if (hours === 12) {
    return `12:${minutes} PM`; // Noon
  }
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours > 12 ? hours - 12 : hours;
  
  return `${hours12}:${minutes} ${period}`;
}

// For validation messages in UI
export function formatTimeForDisplay(time24h: string): string {
  return convertTo12Hour(time24h);
} 