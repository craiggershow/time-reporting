import { TouchableOpacity, StyleSheet, Text, ViewStyle, TextStyle, View } from 'react-native';
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
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  testID?: string;
}

export function Button({ 
  children, 
  onPress, 
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
  leftIcon,
  rightIcon,
  size = 'medium',
  testID,
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

  // Determine button size styles
  const buttonSizeStyle = {
    small: { height: 32, paddingHorizontal: 12 },
    medium: { height: 44, paddingHorizontal: 16 },
    large: { height: 52, paddingHorizontal: 20 },
  }[size];

  // Determine text size based on button size
  const textSizeStyle = {
    small: { fontSize: 14 },
    medium: { fontSize: 16 },
    large: { fontSize: 18 },
  }[size];

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.button,
        buttonSizeStyle,
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
      <View style={styles.buttonContent}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        {typeof children === 'string' ? (
          <Text style={[styles.text, textSizeStyle, { color: textColor }, textStyle]}>
            {children}
          </Text>
        ) : (
          children
        )}
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
}); 