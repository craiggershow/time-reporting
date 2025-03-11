import { StyleSheet, View, TouchableOpacity, Modal, Platform, TextStyle } from 'react-native';
import { Input } from '../ui/Input';
import { useState, useEffect, useRef } from 'react';
import { convertTo24Hour } from '@/utils/time';
import { ThemedText } from '../ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useWindowDimensions } from 'react-native';

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
  const [showTimePicker, setShowTimePicker] = useState(false);
  const inputRef = useRef<any>(null);
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  
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
    if (isMobile && Platform.OS !== 'web') {
      // On mobile devices, show the time picker instead of the keyboard
      setShowTimePicker(true);
    }
  };

  // Generate time options for the time picker
  const generateTimeOptions = () => {
    const options = [];
    
    // Add common work hours (6am to 8pm in 15-minute increments)
    for (let hour = 6; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        const timeString = `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
        options.push(timeString);
      }
    }
    
    return options;
  };

  const handleTimeSelection = (selectedTime: string) => {
    setLocalValue(selectedTime);
    const time24h = convertTo24Hour(selectedTime);
    if (time24h) {
      onChange(time24h);
    }
    setShowTimePicker(false);
    onBlur?.();
  };

  const clearTime = () => {
    setLocalValue('');
    onChange(null);
    setShowTimePicker(false);
    onBlur?.();
  };

  // Use localValue when editing, otherwise use formatted value from props
  // IMPORTANT: Always show the value from props when not editing to ensure consistency
  const displayValue = isEditing ? localValue : (value ? formatTimeForDisplay(value) : '');

  return (
    <View ref={inputRef}>
      {isMobile ? (
        <TouchableOpacity 
          onPress={disabled ? undefined : () => setShowTimePicker(true)}
          style={[
            styles.mobileTimeInput,
            hasError && styles.errorInput,
            disabled && styles.disabledInput
          ]}
        >
          <ThemedText style={
            !displayValue ? styles.placeholderText : styles.mobileTimeText
          }>
            {displayValue || '--:--'}
          </ThemedText>
          {!disabled && (
            <Ionicons 
              name="time-outline" 
              size={18} 
              color={typeof colors?.text === 'string' ? colors.text : '#64748b'} 
              style={styles.timeIcon}
            />
          )}
        </TouchableOpacity>
      ) : (
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
      )}

      {/* Time Picker Modal for Mobile */}
      {isMobile && (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Select Time</ThemedText>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.timeOptionsContainer}>
                {generateTimeOptions().map((timeOption) => (
                  <TouchableOpacity
                    key={timeOption}
                    style={[
                      styles.timeOption,
                      timeOption === displayValue && styles.selectedTimeOption
                    ]}
                    onPress={() => handleTimeSelection(timeOption)}
                  >
                    <ThemedText style={
                      timeOption === displayValue ? styles.selectedTimeOptionText : styles.timeOptionText
                    }>
                      {timeOption}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={clearTime}
                >
                  <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  // Mobile styles
  mobileTimeInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileTimeText: {
    fontSize: 16,
  },
  placeholderText: {
    color: '#94a3b8',
  },
  timeIcon: {
    marginLeft: 8,
  },
  disabledInput: {
    backgroundColor: '#f1f5f9',
    opacity: 0.7,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  timeOptionsContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeOption: {
    width: '30%',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  selectedTimeOption: {
    backgroundColor: '#0ea5e9',
  },
  timeOptionText: {
    fontSize: 14,
  },
  selectedTimeOptionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  modalFooter: {
    padding: 16,
    alignItems: 'center',
  },
  clearButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    width: '50%',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#64748b',
    fontWeight: '600',
  },
}); 