/**
 * Formats a Date object to a string in YYYY-MM-DD format
 * @param date The date to format
 * @returns A string in YYYY-MM-DD format
 */
export function formatDateToString(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.warn('Invalid date provided to formatDateToString:', date);
    return '';
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a date string in YYYY-MM-DD format to a Date object
 * @param dateStr The date string to parse
 * @returns A Date object
 */
export function parseDateString(dateStr: string): Date {
  if (!dateStr || typeof dateStr !== 'string') {
    console.warn('Invalid date string provided to parseDateString:', dateStr);
    return new Date();
  }
  
  const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    console.warn('Invalid date format provided to parseDateString:', dateStr);
    return new Date();
  }
  
  // Create a date object with just the date components (no time)
  return new Date(year, month - 1, day);
}

/**
 * Ensures a date value is in string format (YYYY-MM-DD)
 * @param date The date value (can be Date object or string)
 * @returns A string in YYYY-MM-DD format
 */
export function ensureDateString(date: Date | string): string {
  if (typeof date === 'string') {
    // Validate and normalize the string format
    const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      console.warn('Invalid date string format:', date);
      return formatDateToString(new Date());
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  return formatDateToString(date);
} 