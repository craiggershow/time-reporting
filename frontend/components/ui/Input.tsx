import { TextInput, View, StyleSheet, TextInputProps, StyleProp, ViewStyle, TextStyle, Platform } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { ReactNode, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

// Create a custom interface that doesn't extend TextInputProps to avoid style type conflicts
interface InputProps {
  label?: string;
  leftIcon?: ReactNode | string;
  rightIcon?: ReactNode | string;
  error?: string;
  style?: StyleProp<ViewStyle>;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
  onKeyPress?: (e: any) => void;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  maxLength?: number;
  keyboardType?: TextInputProps['keyboardType'];
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  autoCorrect?: boolean;
  tabIndex?: number;
  passwordRules?: string; // For iOS password rules
}

export function Input({ 
  label, 
  style, 
  leftIcon, 
  rightIcon,
  error,
  onFocus,
  onBlur,
  onKeyPress,
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

  // Render icon based on type (string or ReactNode)
  const renderIcon = (icon: ReactNode | string | undefined) => {
    if (!icon) return null;
    
    if (typeof icon === 'string') {
      return <Ionicons name={icon as any} size={20} color={colors.text.primary} />;
    }
    
    return icon;
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
        {leftIcon ? <View style={styles.iconLeft}>{renderIcon(leftIcon)}</View> : null}
        <TextInput
          style={[
            styles.input,
            leftIcon && { paddingLeft: 40 },
            rightIcon && { paddingRight: 40 }
          ]}
          placeholderTextColor="#94a3b8"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyPress={onKeyPress}
          {...props as any}
        />
        {rightIcon ? <View style={styles.iconRight}>{renderIcon(rightIcon)}</View> : null}
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
        outlineWidth: 0,
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