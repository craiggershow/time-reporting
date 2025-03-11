import { TextInput, View, StyleSheet, TextInputProps, StyleProp, ViewStyle, TextStyle, Platform } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { ReactNode, useState } from 'react';

// Create a custom interface that doesn't extend TextInputProps to avoid style type conflicts
interface InputProps {
  label: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: string;
  style?: StyleProp<ViewStyle>;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  maxLength?: number;
  keyboardType?: TextInputProps['keyboardType'];
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  tabIndex?: number;
}

export function Input({ 
  label, 
  style, 
  leftIcon, 
  rightIcon,
  error,
  onFocus,
  onBlur,
  ...props 
}: InputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  
  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };
  
  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={styles.container}>
      {label ? <ThemedText style={styles.label}>{label}</ThemedText> : null}
      <View style={[
        styles.inputContainer,
        isFocused && styles.focusedContainer,
        error && styles.errorContainer,
        style
      ]}>
        {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
        <TextInput
          style={[
            styles.input,
            leftIcon && { paddingLeft: 40 },
            rightIcon && { paddingRight: 40 }
          ]}
          placeholderTextColor="#94a3b8"
          onFocus={handleFocus}
          onBlur={handleBlur}
          outlineStyle="none"
          {...props as any}
        />
        {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
      </View>
      {error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : null}
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
  inputContainer: { // unfocussed styles
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden', // Ensure input doesn't overflow container
  },
  focusedContainer: {
    borderColor: '#3b82f6', // Blue border for focus state
    borderWidth: 1,
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 16,
    width: '100%', // Ensure input takes full width of container
    borderWidth: 0, // Remove default input border
    ...Platform.select({
      web: {
        outline: 'none',
        outlineStyle: 'none',
      },
    }),
  },
  iconLeft: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  iconRight: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
  },
  errorContainer: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
  },
}); 