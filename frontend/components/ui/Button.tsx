import { TouchableOpacity, StyleSheet, Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useContext } from 'react';
import { createContext } from 'react';

// Default colors to use when ThemeContext is not available
const defaultColors = {
  tint: '#2563eb',
  icon: '#94a3b8',
  background: '#ffffff',
  text: '#1e293b',
  border: '#e2e8f0',
};

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
  // Try to use ThemeContext, but fall back to default colors if not available
  let themeColors = defaultColors;
  
  try {
    const { colors } = useTheme();
    themeColors = colors;
  } catch (error) {
    // ThemeContext not available, use default colors
    console.log('ThemeContext not available, using default colors');
  }
  
  const backgroundColor = variant === 'primary' 
    ? disabled ? themeColors.icon : themeColors.tint 
    : themeColors.background;
  const textColor = variant === 'primary' ? '#fff' : themeColors.text;
  const borderColor = variant === 'secondary' ? themeColors.border : backgroundColor;

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