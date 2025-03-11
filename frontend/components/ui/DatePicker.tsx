import { SafeDateTimePicker } from './SafeDateTimePicker';

interface DatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
}

export function DatePicker({ label, value, onChange, minimumDate }: DatePickerProps) {
  return (
    <SafeDateTimePicker
      label={label}
      value={value}
      onChange={onChange}
      mode="date"
      minimumDate={minimumDate}
    />
  );
} 