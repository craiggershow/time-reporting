import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  return (
    <Pressable 
      style={[
        styles.container,
        styles.checkbox, 
        checked && styles.checked, 
        disabled && styles.disabled
      ]} 
      onPress={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      {checked && <Ionicons name="checkmark" size={16} color="#ffffff" />}
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    marginLeft: 8,
  },
}); 