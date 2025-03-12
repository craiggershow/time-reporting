import { Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/common';
import { ThemedText } from '../ThemedText';

interface CheckboxProps {
  checked: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  labelStyle?: object;
}

export function Checkbox({ checked, onValueChange, label, disabled, labelStyle }: CheckboxProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onValueChange(!checked)}
        disabled={disabled}
        style={({ pressed }) => [
          styles.checkbox,
          checked && styles.checked,
          (pressed || disabled) && styles.pressed,
        ]}
      >
        {checked && (
          <Ionicons 
            name="checkmark-sharp" 
            size={16} 
            color="#ffffff"
            style={styles.checkmark}
          />
        )}
      </Pressable>
      {label && (
        <Pressable onPress={() => onValueChange(!checked)}>
          <ThemedText style={[styles.label, labelStyle]}>{label}</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#64748b',
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  checked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  checkmark: {
    marginTop: 1,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
  },
}); 