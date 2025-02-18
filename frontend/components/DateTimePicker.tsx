import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
}

export function DateTimePicker({ value, onChange, label }: DateTimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [displayValue, setDisplayValue] = useState(formatDate(value));
  const [rawInput, setRawInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDisplayValue(formatDate(value));
      setRawInput('');
    }
  }, [value, isEditing]);

  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatInput(input: string): string {
    // Remove any non-digits
    const numbers = input.replace(/\D/g, '');
    
    // Format with hyphens
    if (numbers.length >= 6) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 8)}`;
    } else if (numbers.length >= 4) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    }
    return numbers;
  }

  function isValidDate(dateStr: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  }

  const handleFocus = () => {
    setIsEditing(true);
    setRawInput(displayValue.replace(/-/g, ''));
  };

  const handleTextChange = (text: string) => {
    // Only allow numbers and limit to 8 digits
    const formattedText = formatInput(text);
    setRawInput(formattedText);
  };

  const handleBlur = () => {
    setIsEditing(false);
    
    // Remove hyphens for validation
    const dateStr = rawInput.replace(/-/g, '');
    
    if (dateStr.length === 8) {
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      const fullDateStr = `${year}-${month}-${day}`;
      
      if (isValidDate(fullDateStr)) {
        const newDate = new Date(fullDateStr);
        onChange(newDate);
        setDisplayValue(formatDate(newDate));
      } else {
        setDisplayValue(formatDate(value));
      }
    } else {
      setDisplayValue(formatDate(value));
    }
    setRawInput('');
  };

  const handlePickerChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      onChange(selectedDate);
      setIsEditing(false);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={isEditing ? rawInput : displayValue}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="YYYY-MM-DD"
          keyboardType="numeric"
          maxLength={10} // Account for hyphens
        />
        <Pressable 
          style={styles.button}
          onPress={() => setShowPicker(true)}
        >
          <Text>📅</Text>
        </Pressable>
      </View>
      {showPicker && (
        <RNDateTimePicker
          value={value}
          onChange={handlePickerChange}
          mode="date"
          display="default"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
}); 