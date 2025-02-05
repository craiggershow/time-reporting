import { TouchableOpacity, StyleSheet, Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface ButtonProps {
  children: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function Button({ 
  children, 
  onPress, 
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
}: ButtonProps) {
  const { colors } = useTheme();
  
  const backgroundColor = variant === 'primary' 
    ? disabled ? colors.icon : colors.tint 
    : colors.background;
  const textColor = variant === 'primary' ? '#fff' : colors.text;
  const borderColor = variant === 'secondary' ? colors.border : backgroundColor;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor,
          borderColor,
          borderWidth: variant === 'secondary' ? 1 : 0,
          opacity: disabled ? 0.7 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      <Text style={[styles.text, { color: textColor }, textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 