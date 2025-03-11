import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/context/ThemeContext';
import { DayType } from '@/types/timesheet';
import { useEffect } from 'react';
import { isWeb } from '@/utils/platform';

// Add global style to remove focus outlines from select elements on web
if (isWeb() && typeof document !== 'undefined' && document !== null) {
  try {
    if (typeof document.createElement === 'function' && document.head) {
      const style = document.createElement('style');
      style.textContent = `
        select:focus, select:active {
          outline: none !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          border-color: #e2e8f0 !important;
          border-radius: 8px !important;
        }
      `;
      document.head.appendChild(style);
    }
  } catch (error) {
    console.warn('Error adding global style for select elements:', error);
  }
}

interface DayTypeSelectProps {
  value: DayType;
  onChange: (value: DayType) => void;
  disabled?: boolean;
}

const DAY_TYPES: { value: DayType; label: string }[] = [
  { value: 'regular', label: 'Regular' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'sick', label: 'Sick' },
];

export function DayTypeSelect({ value = 'regular', onChange, disabled }: DayTypeSelectProps) {
  const { colors } = useTheme();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: '#ffffff', // White background
        borderColor: colors.border,
      }
    ]}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          enabled={!disabled}
          style={[
            styles.picker, 
            { 
              color: '#1e293b',
              // Remove default focus styling
              outline: 'none',
            }
          ]} 
          dropdownIconColor="#1e293b" // Dark icon
          itemStyle={styles.pickerItem}
        >
          {DAY_TYPES.map((type) => (
            <Picker.Item
              key={type.value}
              label={type.label}
              value={type.value}
              color="#1e293b" // Dark text for dropdown items
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  pickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    width: 120,
    height: 40,
    textAlign: 'center',
    borderWidth: 0, // Remove default border
    borderRadius: 8, // Match container border radius
  },
  pickerItem: {
    textAlign: 'center',
  },
}); 