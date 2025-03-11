import { StyleSheet, View } from 'react-native';
import { Input } from '../ui/Input';
import { useState, useEffect, useRef } from 'react';
import { convertTo24Hour } from '@/utils/time';

interface TimeInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
  onBlur?: () => void;
  disabled?: boolean;
  hasError?: boolean;
  onKeyDown?: (e: KeyboardEvent) => void;
  tabIndex?: 0 | -1;
}



const parseTimeInput = (input: string): string | null => {
  if (!input) return null;
  
  // Remove spaces and convert to uppercase
  input = input.replace(/\s/g, '').toUpperCase();
  
  // Clean up any invalid characters first
  input = input.replace(/[^0-9APM:]/g, '');
  
  // Handle various formats
  const formats = [
    // 1p, 1pm, 1:00p, 1:00pm
    /^(\d{1,2})(?::?(\d{2}))?(P|PM|A|AM)?$/,
    // 100p, 100pm, 1300, etc
    /^(\d{3,4})(P|PM|A|AM)?$/
  ];
  
  for (const format of formats) {
    const match = input.match(format);
    if (match) {
      let hours, minutes, period;
      
      if (match[1].length > 2) {
        // Handle military-style input (e.g., "1300")
        const timeStr = match[1].padStart(4, '0');
        hours = parseInt(timeStr.slice(0, 2), 10);
        minutes = timeStr.slice(2);
      } else {
        hours = parseInt(match[1], 10);
        minutes = match[2] || '00';
      }
      
      // Normalize hours to be between 1 and 12
      if (hours > 12) {
        hours = hours % 12 || 12;
      }
      if (hours === 0) {
        hours = 12;
      }
      
      period = match[match.length - 1] || '';
      
      // Default to AM if no period specified and hours < 7
      // Default to PM if no period specified and hours >= 7
      if (!period) {
        period = hours >= 7 && hours !== 12 ? 'PM' : 'AM';
      }
      
      // Normalize period
      period = period.length === 1 ? period + 'M' : period;
      
      // Format the final time
      return `${hours}:${minutes.padStart(2, '0')} ${period}`;
    }
  }
  
  return null;
};

// Simple function to format time for display
function formatTimeForDisplay(time: string | null): string {
  if (!time) return '';
  
  // Check if the time is already in 12-hour format
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }
  
  // Format time from 24-hour to 12-hour format
  try {
    // Handle simple hour format (e.g., "8" -> "8:00 AM")
    if (/^\d{1,2}$/.test(time)) {
      const hours = parseInt(time, 10);
      if (hours >= 0 && hours <= 23) {
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
        return `${hours12}:00 ${period}`;
      }
    }
    
    // Handle HH:MM format
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      const [hours24, minutes] = time.split(':');
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
    
    // If we can't parse it, return as is
    return time;
  } catch (error) {
    console.error('Error formatting time:', error);
    return time; // Return original if parsing fails
  }
}

export function TimeInput({ 
  value,
  onChange,
  hasError,
  disabled,
  onBlur,
  onKeyDown,
  tabIndex,
}: TimeInputProps) {
  // Initialize localValue from the value prop
  const [localValue, setLocalValue] = useState(value ? formatTimeForDisplay(value) : '');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<any>(null);
  
  // Update localValue when value prop changes and we're not editing
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value ? formatTimeForDisplay(value) : '');
    }
  }, [value, isEditing]);

  // Use effect to capture the input element and remove its focus outline
  useEffect(() => {
    if (typeof document !== 'undefined' && inputRef.current) {
      // Try to get the actual input element
      const inputElement = inputRef.current.querySelector('input');
      if (inputElement) {
        inputElement.style.outline = 'none';
        inputElement.style.boxShadow = 'none';
        inputElement.style.webkitAppearance = 'none';
      }
    }
  }, []);

  const handleChange = (text: string) => {
    // Store the raw input value
    setLocalValue(text);
    
    // Only clear value if empty or placeholder
    if (!text || text === '--:--') {
      onChange(null);
    }
    // Don't process the time yet, just store the local value
    // We'll process it on blur
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    
    // Clear value if empty or placeholder
    if (!localValue || localValue === '--:--') {
      onChange(null);
      setLocalValue('');
      onBlur?.();
      return;
    }

    // Now process the time when the user is done typing
    // Try to convert the input to 24-hour format
    let time24h = convertTo24Hour(localValue);
    
    if (time24h) {
      onChange(time24h);
    } else {
      // If direct conversion fails, try to parse it as a simple number (e.g., "8" -> "08:00")
      const simpleNumberMatch = localValue.match(/^(\d{1,2})$/);
      if (simpleNumberMatch) {
        const hours = parseInt(simpleNumberMatch[1], 10);
        if (hours >= 0 && hours <= 23) {
          time24h = `${hours.toString().padStart(2, '0')}:00`;
          onChange(time24h);
        } else {
          setLocalValue(value ? formatTimeForDisplay(value) : '');
        }
      } else {
        // If parsing fails, keep the previous valid value
        setLocalValue(value ? formatTimeForDisplay(value) : '');
      }
    }
    
    onBlur?.();
  };

  const handleInputFocus = () => {
    setIsEditing(true);
  };

  // Use localValue when editing, otherwise use formatted value from props
  // IMPORTANT: Always show the value from props when not editing to ensure consistency
  const displayValue = isEditing ? localValue : (value ? formatTimeForDisplay(value) : '');

  return (
    <View ref={inputRef}>
      <Input
        label=""
        value={displayValue}
        onChangeText={handleChange}
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
        placeholder="--:--"
        style={[styles.input, hasError && styles.errorInput]}
        editable={!disabled}
        maxLength={8} // "12:45 PM" is 8 characters
        tabIndex={tabIndex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    width: 100,
    textAlign: 'center',
  },
  errorInput: {
    borderColor: '#ef4444',
    borderWidth: 2,
    borderRadius: 4,
  },
}); 