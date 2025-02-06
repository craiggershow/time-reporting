import { StyleSheet } from 'react-native';
import { Input } from '../ui/Input';
import { useState, useEffect } from 'react';

interface TimeInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const parseTimeInput = (input: string): string | null => {
  if (!input) return null;
  
  // Remove spaces and convert to uppercase
  input = input.replace(/\s/g, '').toUpperCase();
  
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
      
      period = match[match.length - 1] || '';
      
      // Default to AM if no period specified
      if (!period && hours < 12) period = 'AM';
      if (!period && hours >= 12) period = 'PM';
      
      // Normalize period
      period = period.length === 1 ? period + 'M' : period;
      
      // Format the final time
      return `${hours}:${minutes.padStart(2, '0')} ${period}`;
    }
  }
  
  return input;
};

export function TimeInput({ 
  value, 
  onChange, 
  onBlur,
  placeholder = "9:00 AM",
  disabled 
}: TimeInputProps) {
  const [localValue, setLocalValue] = useState(value || '');
  
  // Add useEffect to update local state when prop changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);
  
  const handleChange = (text: string) => {
    setLocalValue(text);
    
    if (!text) {
      onChange(null);
      return;
    }
    
    const parsedTime = parseTimeInput(text);
    if (parsedTime) {
      onChange(parsedTime);
    }
  };

  const handleInputBlur = () => {
    if (localValue) {
      const parsedTime = parseTimeInput(localValue);
      setLocalValue(parsedTime || localValue);
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
      style={styles.input}
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
  }
}); 