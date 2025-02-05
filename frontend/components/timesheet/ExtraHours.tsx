import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Input } from '../ui/Input';
import { useTheme } from '@/context/ThemeContext';

interface ExtraHoursProps {
  value: number;
  onChange: (hours: number) => void;
}

export function ExtraHours({ value, onChange }: ExtraHoursProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.inputBackground }]}>
      <ThemedText>Extra Hours:</ThemedText>
      <Input
        label=""
        value={value.toString()}
        onChangeText={(text) => onChange(parseFloat(text) || 0)}
        keyboardType="numeric"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  input: {
    width: 80,
    textAlign: 'right',
  },
}); 