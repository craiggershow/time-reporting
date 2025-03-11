import { SafeDateTimePicker } from './SafeDateTimePicker';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time';
  label?: string;
}

export function DateTimePicker({ value, onChange, mode = 'date', label }: DateTimePickerProps) {
  return (
    <SafeDateTimePicker
      value={value}
      onChange={onChange}
      mode={mode}
      label={label}
    />
  );
} 