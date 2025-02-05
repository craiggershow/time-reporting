import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/context/ThemeContext';
import { DayType } from '@/types/timesheet';

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
          style={[styles.picker, { color: '#1e293b' }]} // Dark text
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
  },
  pickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  picker: {
    width: 120,
    height: 40,
    textAlign: 'center',
  },
  pickerItem: {
    textAlign: 'center',
  },
}); 