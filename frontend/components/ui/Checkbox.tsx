import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/common';

interface CheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({ value, onValueChange, disabled }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      style={({ pressed }) => ({
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 3,
        borderColor: value ? colors.primary : colors.text.secondary,
        backgroundColor: value ? colors.primary : '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: (pressed || disabled) ? 0.7 : 1,
      })}
    >
      {value && (
        <Ionicons 
          name="checkmark" 
          size={18} 
          color="#ffffff"
        />
      )}
    </Pressable>
  );
} 