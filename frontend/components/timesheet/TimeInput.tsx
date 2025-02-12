import { StyleSheet } from 'react-native';
import { Input } from '../ui/Input';
import { useState, useEffect } from 'react';
import { convertTo24Hour } from '@/utils/time';

interface TimeInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
  onBlur?: () => void;
  disabled?: boolean;
  hasError?: boolean;
  onKeyDown?: (e: KeyboardEvent) => void;
  tabIndex?: number;
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

export function TimeInput({ 
  value,
  onChange,
  hasError,
  disabled,
  onBlur,
  onKeyDown,
  tabIndex,
}: TimeInputProps) {
  const [localValue, setLocalValue] = useState(value || '');
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value || '');
    }
  }, [value, isEditing]);

  const handleChange = (text: string) => {
    setLocalValue(text);
    
    // Clear value if empty or placeholder
    if (!text || text === '--:--') {
      onChange(null);
      return;
    }
    
    // Only try to parse and convert if it looks like a complete time
    if (text.match(/^\d{1,2}(:\d{2})?\s*(AM|PM|A|P)?$/i)) {
      const time24h = convertTo24Hour(text);
      onChange(time24h);
    }
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

    const time24h = convertTo24Hour(localValue);
    if (time24h) {
      onChange(time24h);
    } else {
      // If parsing fails, keep the previous valid value
      setLocalValue(value || '');
    }
    onBlur?.();
  };

  const handleInputFocus = () => {
    setIsEditing(true);
  };

  return (
    <Input
      label=""
      value={localValue}
      onChangeText={handleChange}
      onBlur={handleInputBlur}
      onFocus={handleInputFocus}
      placeholder="--:--"
      style={[styles.input, hasError && styles.errorInput]}
      editable={!disabled}
      maxLength={8} // "12:45 PM" is 8 characters
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
    />
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