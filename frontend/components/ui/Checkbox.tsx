import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label: string;
}

export function Checkbox({ checked, onPress, label }: CheckboxProps) {
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View 
        style={[
          styles.checkbox, 
          { 
            borderColor: checked ? colors.tint : colors.border,
            backgroundColor: checked ? colors.tint : 'transparent',
          }
        ]}
      >
        {checked && (
          <View style={styles.checkmark}>
            <Text 
              style={[
                styles.check, 
                { color: '#fff' }
              ]}
            >
              ✓
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  check: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
  },
}); 