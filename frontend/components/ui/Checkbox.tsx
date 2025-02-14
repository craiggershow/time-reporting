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
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: value ? colors.primary : colors.border,
        backgroundColor: value ? colors.primary : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: (pressed || disabled) ? 0.7 : 1,
      })}
    >
      {value && (
        <Ionicons 
          name="checkmark" 
          size={16} 
          color="#ffffff"
        />
      )}
    </Pressable>
  );
} 