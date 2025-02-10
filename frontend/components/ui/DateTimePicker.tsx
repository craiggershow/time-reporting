import { View, StyleSheet, Platform } from 'react-native';
import { useState } from 'react';
import DateTimePickerNative from '@react-native-community/datetimepicker';
import { Button } from './Button';
import { ThemedText } from '../ThemedText';
import { format } from 'date-fns';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time';
}

export function DateTimePicker({ value, onChange, mode = 'date' }: DateTimePickerProps) {
  const [show, setShow] = useState(false);

  const handleChange = (_: any, selectedDate?: Date) => {
    setShow(false);
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <input
        type={mode}
        value={mode === 'date' ? format(value, 'yyyy-MM-dd') : format(value, 'HH:mm')}
        onChange={(e) => {
          const newDate = new Date(e.target.value);
          if (!isNaN(newDate.getTime())) {
            onChange(newDate);
          }
        }}
        style={styles.webInput}
      />
    );
  }

  return (
    <View>
      <Button
        variant="secondary"
        onPress={() => setShow(true)}
      >
        <ThemedText>
          {mode === 'date' 
            ? format(value, 'MMMM d, yyyy')
            : format(value, 'h:mm a')
          }
        </ThemedText>
      </Button>

      {show && (
        <DateTimePickerNative
          value={value}
          mode={mode}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  webInput: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    fontSize: 16,
  },
}); 