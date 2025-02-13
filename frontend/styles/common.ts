import { StyleSheet } from 'react-native';

// Color palette
export const colors = {
  primary: '#2563eb',
  appBackground: '#f1f5f9',
  adminBackground: '#334155',
  border: '#e2e8f0',
  text: {
    primary: '#000000',
    secondary: '#4b5563',
    error: '#dc2626',
    light: '#f8fafc',     // Add light text color
    lightSecondary: '#cbd5e1', // Add secondary light text
  },
  input: {
    border: '#d1d5db',
  },
  status: {
    success: '#22c55e',
    error: '#dc2626',
    errorBg: '#fee2e2',
  },
  button: {
    primary: {
      background: '#2563eb',
      text: '#ffffff',
    },
    secondary: {
      background: '#f1f5f9',
      text: '#1e293b',
      border: '#e2e8f0',
    },
    danger: {
      background: '#dc2626',
      text: '#ffffff',
    },
  },
  modal: {
    overlay: 'rgba(0, 0, 0, 0.5)',
    background: '#ffffff',
  },
};

// Common spacing values
export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
};

// Common styles
export const commonStyles = StyleSheet.create({
  // Page level styles
  pageContainer: {
    flex: 1,
    padding: spacing.md,
  },
  
  // Card styles
  contentCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
  },
  
  // Header styles
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  // Form styles
  formInput: {
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: 6,
    padding: spacing.sm,
    fontSize: 16,
  },
  formInputWrapper: {
    marginBottom: spacing.md,
  },
  formLabel: {
    marginBottom: spacing.xs,
    fontSize: 14,
    color: colors.text.light,
  },
  
  // Error styles
  errorContainer: {
    backgroundColor: colors.status.errorBg,
    padding: spacing.sm,
    borderRadius: 6,
    marginBottom: spacing.md,
  },
  errorMessage: {
    color: colors.status.error,
    backgroundColor: 'rgba(254, 226, 226, 0.1)',
  },
  
  // Button container styles
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  
  // Table styles
  tableContainer: {
    headerRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerCell: {
      padding: spacing.sm,
      minWidth: 120,
    },
    row: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    cell: {
      padding: spacing.sm,
      minWidth: 120,
    },
  },
  
  // Text styles for admin portal
  lightText: {
    color: colors.text.light,
  },
  lightTextSecondary: {
    color: colors.text.lightSecondary,
  },
}); 