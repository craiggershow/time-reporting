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
  
  // Handle 12-hour cases
  if (hoursNum === 12) {
    hoursNum = period === "am" ? 0 : 12;
  } else if (period === "pm") {
    hoursNum += 12;
  }
  
  // Format output
  return `${hoursNum.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
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