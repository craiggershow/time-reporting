import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({ label, value, onChange, disabled }: CheckboxProps) {
  return (
    <Pressable 
      style={styles.container} 
      onPress={() => !disabled && onChange(!value)}
      disabled={disabled}
    >
      <View style={[
        styles.checkbox,
        value && styles.checked,
        disabled && styles.disabled
      ]}>
        {value && <Ionicons name="checkmark" size={16} color="#ffffff" />}
      </View>
      <ThemedText>{label}</ThemedText>
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
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  disabled: {
    opacity: 0.5,
  },
}); 