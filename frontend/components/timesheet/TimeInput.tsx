import { StyleSheet } from 'react-native';
import { Input } from '../ui/Input';
import { useState, useEffect } from 'react';

interface TimeInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
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
  onBlur,
  placeholder = "9:00 AM",
  disabled,
  hasError 
}: TimeInputProps) {
  const [localValue, setLocalValue] = useState(value || '');
  
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);
  
  const handleChange = (text: string) => {
    // Just update local state and pass through the raw value
    setLocalValue(text);
    
    if (!text) {
      onChange(null);
      return;
    }
  };

  const handleInputBlur = () => {
    if (localValue) {
      const parsedTime = parseTimeInput(localValue);
      if (parsedTime) {
        setLocalValue(parsedTime);
        onChange(parsedTime);
      } else {
        // If parsing fails, keep the previous valid value
        setLocalValue(value || '');
      }
    }
    onBlur?.();
  };

  return (
    <Input
      label=""
      value={localValue}
      onChangeText={handleChange}
      onBlur={handleInputBlur}
      placeholder={placeholder}
      style={[styles.input, hasError && styles.errorInput]}
      editable={!disabled}
      maxLength={8} // "12:45 PM" is 8 characters
      autoCapitalize="characters"
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