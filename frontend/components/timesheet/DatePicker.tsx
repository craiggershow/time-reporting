import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useTheme } from '@/context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useState } from 'react';

interface DatePickerProps {
  date: Date;
  onChange: (date: Date) => void;
}

export function DatePicker({ date, onChange }: DatePickerProps) {
  const { colors } = useTheme();
  const [show, setShow] = useState(false);

  return (
    <View style={styles.container}>
      <ThemedText>Pay Period Start Date:</ThemedText>
      <TouchableOpacity
        onPress={() => setShow(true)}
        style={[styles.button, { backgroundColor: colors.inputBackground }]}
      >
        <ThemedText>{format(date, 'MMMM d, yyyy')}</ThemedText>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          onChange={(event, selectedDate) => {
            setShow(false);
            if (selectedDate) {
              onChange(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  button: {
    padding: 8,
    borderRadius: 8,
  },
}); 