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
  },
  input: {
    border: '#d1d5db',
  },
  status: {
    success: '#22c55e',
    error: '#dc2626',
    errorBg: '#fee2e2',
  }
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
    color: colors.text.secondary,
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
}); 