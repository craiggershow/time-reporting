import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { SafeDateTimePicker } from '../ui/SafeDateTimePicker';

interface DatePickerProps {
  date: Date;
  onChange: (date: Date) => void;
}

export function DatePicker({ date, onChange }: DatePickerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText>Pay Period Start Date:</ThemedText>
      <SafeDateTimePicker
        value={date}
        onChange={onChange}
        mode="date"
      />
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
}); 