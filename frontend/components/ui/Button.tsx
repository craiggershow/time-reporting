import { TouchableOpacity, StyleSheet, Text, ViewStyle, TextStyle, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useContext } from 'react';
import { createContext } from 'react';
import { Ionicons } from '@expo/vector-icons';

// Default colors to use when ThemeContext is not available
const defaultColors = {
  tint: '#2563eb',
  icon: '#94a3b8',
  background: '#ffffff',
  text: '#1e293b',
  border: '#e2e8f0',
};

interface ButtonProps {
  children?: React.ReactNode;
  label?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  leftIcon?: React.ReactNode | string;
  rightIcon?: React.ReactNode | string;
  size?: 'small' | 'medium' | 'large';
  testID?: string;
  isLoading?: boolean;
}

export function Button({ 
  children, 
  label,
  onPress, 
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
  leftIcon,
  rightIcon,
  size = 'medium',
  testID,
  isLoading = false,
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

  // Render icon based on string or ReactNode
  const renderIcon = (icon: React.ReactNode | string) => {
    if (typeof icon === 'string') {
      return (
        <Ionicons 
          name={icon as any} 
          size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} 
          color={variant === 'primary' ? '#fff' : themeColors.text} 
        />
      );
    }
    return icon;
  };

  // Use label if provided, otherwise use children
  const buttonText = label || (typeof children === 'string' ? children : null);

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
          opacity: disabled || isLoading ? 0.7 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}>
      <View style={styles.buttonContent}>
        {isLoading ? (
          <Text style={[styles.text, textSizeStyle, { color: textColor }, textStyle]}>
            Loading...
          </Text>
        ) : (
          <>
            {leftIcon && <View style={styles.iconLeft}>{renderIcon(leftIcon)}</View>}
            {buttonText ? (
              <Text style={[styles.text, textSizeStyle, { color: textColor }, textStyle]}>
                {buttonText}
              </Text>
            ) : (
              children
            )}
            {rightIcon && <View style={styles.iconRight}>{renderIcon(rightIcon)}</View>}
          </>
        )}
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