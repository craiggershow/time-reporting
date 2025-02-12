// For internal use and API communication - always 24-hour format
export function convertTo24Hour(time12h: string | null): string | null {
  console.log('convertTo24Hour input:', time12h);
  
  if (!time12h || time12h.trim() === '') return null;
  
  // First check if already in 24-hour format
  if (time12h.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    console.log('Already in 24-hour format:', time12h);
    return time12h;
  }
  
  // Normalize input by removing spaces and converting to lowercase
  const input = time12h.toLowerCase().replace(/\s+/g, '');
  console.log('convertTo24Hour normalized:', input);
  
  // Return null for placeholder value
  if (input === '--:--') return null;
  
  // Extract hours, minutes, and period using regex for 12-hour format
  const timeRegex = /^(\d{1,2})(?::?(\d{2}))?\s*(a|am|p|pm)?$/i;
  const match = input.match(timeRegex);
  console.log('convertTo24Hour regex match:', match);
  
  if (!match) return null;
  
  let [_, hours, minutes, period] = match;
  let hoursNum = parseInt(hours);
  
  // Default minutes to "00" if not provided
  minutes = minutes || "00";
  
  // Default period to "am" if not provided
  period = period || "a";
  
  // Normalize period to "am" or "pm"
  period = period === "a" || period === "am" ? "am" : "pm";
  
  console.log('convertTo24Hour parsed:', { hoursNum, minutes, period });
  
  // Handle special cases for 12 AM/PM
  if (period === "pm") {
    if (hoursNum !== 12) {
      hoursNum += 12;
    }
  } else if (period === "am" && hoursNum === 12) {
    hoursNum = 0;
  }
  
  const result = `${hoursNum.toString().padStart(2, '0')}:${minutes}`;
  console.log('convertTo24Hour result:', result);
  return result;
}

// For UI display only - converts 24-hour to 12-hour format
export function convertTo12Hour(time24h: string | null): string {
  if (!time24h) return "--:--";
  
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
export function formatTimeForDisplay(time24h: string | null): string {
  if (!time24h) return '--:--';
  return convertTo12Hour(time24h);
} 