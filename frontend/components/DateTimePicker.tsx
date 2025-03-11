import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeDateTimePicker } from './ui/SafeDateTimePicker';

interface DateTimePickerProps {
  value: Date | string;
  onChange: (date: Date | string) => void;
  label?: string;
  returnFormat?: 'date' | 'string';
}

export function DateTimePicker({ 
  value, 
  onChange, 
  label,
  returnFormat = 'date' 
}: DateTimePickerProps) {
  // Convert string value to Date if needed
  const [dateValue, setDateValue] = useState<Date>(
    typeof value === 'string' ? new Date(value) : value
  );

  // Update dateValue when value prop changes
  useEffect(() => {
    if (typeof value === 'string') {
      // Parse the date string (YYYY-MM-DD)
      const [year, month, day] = value.split('-').map(num => parseInt(num, 10));
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        setDateValue(date);
      }
    } else {
      setDateValue(value);
    }
  }, [value]);

  // Handle date changes
  const handleChange = (date: Date) => {
    setDateValue(date);
    
    if (returnFormat === 'string') {
      // Format as YYYY-MM-DD string
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      onChange(formattedDate);
    } else {
      onChange(date);
    }
  };

  return (
    <View style={styles.container}>
      <SafeDateTimePicker
        value={dateValue}
        onChange={handleChange}
        mode="date"
        label={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
}); 