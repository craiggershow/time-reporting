import { TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useTheme } from '@/context/ThemeContext';

interface InputProps extends TextInputProps {
  label: string;
}

export function Input({ label, style, ...props }: InputProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: '#ffffff',
            color: '#1e293b',
            borderColor: colors.border,
          },
          style,
        ]}
        placeholderTextColor="#94a3b8"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
}); 