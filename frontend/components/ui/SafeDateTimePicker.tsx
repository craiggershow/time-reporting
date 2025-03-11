import { View, StyleSheet, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '../ThemedText';
import { Button } from './Button';
import { format } from 'date-fns';
import { isWeb, isAndroid, isIOS, platformSelect } from '@/utils/platform';

// Safely import the native module
let DateTimePickerNative: any = null;
try {
  // Only import on non-web platforms
  if (!isWeb()) {
    DateTimePickerNative = require('@react-native-community/datetimepicker').default;
  }
} catch (error) {
  console.warn('Error importing DateTimePicker native module:', error);
}

interface SafeDateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time';
  minimumDate?: Date;
  label?: string;
}

export function SafeDateTimePicker({ 
  value, 
  onChange, 
  mode = 'date',
  minimumDate,
  label
}: SafeDateTimePickerProps) {
  const [show, setShow] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // Update input value when the date changes
    if (mode === 'date') {
      setInputValue(format(value, 'yyyy-MM-dd'));
    } else {
      setInputValue(format(value, 'HH:mm'));
    }
  }, [value, mode]);

  const handleChange = (_: any, selectedDate?: Date) => {
    // On Android, hide the picker after selection
    if (isAndroid()) {
      setShow(false);
    }
    
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      onChange(selectedDate);
    }
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    
    // Try to parse the input as a date
    if (mode === 'date') {
      const newDate = new Date(text);
      if (!isNaN(newDate.getTime())) {
        onChange(newDate);
      }
    } else {
      // For time input, parse HH:MM format
      const [hours, minutes] = text.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const newDate = new Date(value);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        onChange(newDate);
      }
    }
  };

  // Format the date for display
  const getFormattedDate = () => {
    if (mode === 'date') {
      return format(value, 'MMMM d, yyyy');
    } else {
      return format(value, 'h:mm a');
    }
  };

  // Use platformSelect to handle platform-specific rendering
  return platformSelect({
    // Web implementation
    web: () => (
      <View style={styles.container}>
        {label && <ThemedText style={styles.label}>{label}</ThemedText>}
        <TextInput
          style={styles.webInput}
          value={inputValue}
          onChangeText={handleInputChange}
          placeholder={mode === 'date' ? 'YYYY-MM-DD' : 'HH:MM'}
        />
      </View>
    ),
    
    // Android implementation
    android: () => {
      if (!DateTimePickerNative) {
        // Fallback if the native module is not available
        return (
          <View style={styles.container}>
            {label && <ThemedText style={styles.label}>{label}</ThemedText>}
            <TextInput
              style={styles.webInput}
              value={inputValue}
              onChangeText={handleInputChange}
              placeholder={mode === 'date' ? 'YYYY-MM-DD' : 'HH:MM'}
            />
          </View>
        );
      }
      
      return (
        <View style={styles.container}>
          {label && <ThemedText style={styles.label}>{label}</ThemedText>}
          <Button
            variant="secondary"
            onPress={() => setShow(true)}
          >
            <ThemedText>{getFormattedDate()}</ThemedText>
          </Button>

          {show && (
            <DateTimePickerNative
              testID="dateTimePicker"
              value={value}
              mode={mode}
              is24Hour={false}
              display="default"
              onChange={handleChange}
              minimumDate={minimumDate}
            />
          )}
        </View>
      );
    },
    
    // iOS implementation
    ios: () => {
      if (!DateTimePickerNative) {
        // Fallback if the native module is not available
        return (
          <View style={styles.container}>
            {label && <ThemedText style={styles.label}>{label}</ThemedText>}
            <TextInput
              style={styles.webInput}
              value={inputValue}
              onChangeText={handleInputChange}
              placeholder={mode === 'date' ? 'YYYY-MM-DD' : 'HH:MM'}
            />
          </View>
        );
      }
      
      return (
        <View style={styles.container}>
          {label && <ThemedText style={styles.label}>{label}</ThemedText>}
          <Button
            variant="secondary"
            onPress={() => setShow(true)}
          >
            <ThemedText>{getFormattedDate()}</ThemedText>
          </Button>

          {show && (
            <DateTimePickerNative
              value={value}
              mode={mode}
              onChange={handleChange}
              display="spinner"
              minimumDate={minimumDate}
            />
          )}
        </View>
      );
    },
    
    // Default implementation (fallback)
    default: () => (
      <View style={styles.container}>
        {label && <ThemedText style={styles.label}>{label}</ThemedText>}
        <TextInput
          style={styles.webInput}
          value={inputValue}
          onChangeText={handleInputChange}
          placeholder={mode === 'date' ? 'YYYY-MM-DD' : 'HH:MM'}
        />
      </View>
    )
  }) as JSX.Element;
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  webInput: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    fontSize: 16,
  },
}); 