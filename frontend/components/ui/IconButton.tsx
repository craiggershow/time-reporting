import { TouchableOpacity, StyleSheet, ViewStyle, View } from 'react-native';
import React from 'react';

interface IconButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  disabled?: boolean;
}

export function IconButton({ 
  children, 
  onPress, 
  variant = 'primary',
  style,
  disabled = false,
}: IconButtonProps) {
  // Use hardcoded colors instead of ThemeContext
  const backgroundColor = variant === 'primary' 
    ? disabled ? '#94a3b8' : '#2563eb' 
    : '#ffffff';
  const borderColor = variant === 'secondary' ? '#e2e8f0' : backgroundColor;

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
      activeOpacity={0.7}
    >
      {children}
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
}); 