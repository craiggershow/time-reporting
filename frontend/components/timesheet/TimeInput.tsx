import { StyleSheet } from 'react-native';
import { Input } from '../ui/Input';

interface TimeInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const parseTimeInput = (input: string): string | null => {
  if (!input) return null;
  
  // Remove spaces and convert to uppercase
  input = input.replace(/\s/g, '').toUpperCase();
  
  // Handle formats like "12PM", "1130AM", "230P"
  const match = input.match(/^(\d{1,2})(?:(\d{2}))?(AM|PM|A|P)?$/i);
  if (!match) return null;
  
  let [_, hours, minutes, period] = match;
  
  // Convert hours to number
  let hoursNum = parseInt(hours, 10);
  
  // Handle period (AM/PM)
  if (period) {
    period = period.length === 1 ? period + 'M' : period;
    if (period === 'PM' && hoursNum < 12) hoursNum += 12;
    if (period === 'AM' && hoursNum === 12) hoursNum = 0;
  }
  
  // Format minutes
  const mins = minutes ? minutes : '00';
  
  // Format the final time
  return `${hoursNum.toString().padStart(2, '0')}:${mins} ${period || 'AM'}`;
};

export function TimeInput({ value, onChange, placeholder = "9:00 AM", disabled }: TimeInputProps) {
  const handleChange = (text: string) => {
    if (!text) {
      onChange(null);
      return;
    }
    
    const parsedTime = parseTimeInput(text);
    onChange(parsedTime);
  };

  return (
    <Input
      label=""
      value={value || ''}
      onChangeText={handleChange}
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
  },
}); 