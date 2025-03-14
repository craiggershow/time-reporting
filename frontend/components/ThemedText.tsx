import { Text, TextStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { colors } from '@/styles/common';

interface ThemedTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  type?: 'default' | 'title' | 'subtitle' | 'link' | 'defaultSemiBold';
}

export function ThemedText({ children, style, type = 'default' }: ThemedTextProps) {
  // Default to light theme if ThemeContext is not available
  let isDark = false;
  
  try {
    const theme = useTheme();
    isDark = theme.isDark;
  } catch (error) {
    // If ThemeContext is not available, use default (light theme)
    console.log('ThemedText: ThemeContext not available, using default theme');
  }

  const baseStyle: TextStyle = {
    color: isDark ? colors.text.light : colors.text.primary,
  };

  const typeStyles: Record<string, TextStyle> = {
    default: baseStyle,
    defaultSemiBold: {
      ...baseStyle,
      fontSize: 16,
      fontWeight: '600',
    },
    title: {
      ...baseStyle,
      fontSize: 24,
      fontWeight: '600',
      marginBottom: 8,
    },
    subtitle: {
      ...baseStyle,
      fontSize: 18,
      fontWeight: '500',
      marginBottom: 4,
    },
    link: {
      ...baseStyle,
      color: colors.primary,
      textDecorationLine: 'underline',
    },
  };

  return (
    <Text style={[typeStyles[type], style]}>
      {children}
    </Text>
  );
}
