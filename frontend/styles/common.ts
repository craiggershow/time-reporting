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
  background: {
    page: '#f1f5f9',    // Light gray for page backgrounds
    card: '#ffffff',     // White for card backgrounds
    tableHeader: '#f8fafc', // Slightly different gray for table headers
    tableAlt: '#f8fafc',    // Alternating row color
  },
  table: {
    header: {
      background: '#1e293b',
      text: '#f8fafc',
      border: '#475569',
    },
    row: {
      background: 'transparent',
      alternateBackground: 'rgba(255, 255, 255, 0.02)',
      text: '#f8fafc',
      border: '#475569',
    },
    status: {
      active: {
        background: '#dcfce7',
        text: '#166534',
      },
      inactive: {
        background: '#fee2e2',
        text: '#991b1b',
      },
    }
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
    backgroundColor: colors.background.page,
    padding: spacing.md,
  },
  
  // Card styles
  contentCard: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
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
      backgroundColor: '#1e293b',
      borderBottomWidth: 1,
      borderBottomColor: '#475569',
    },
    headerCell: {
      padding: spacing.sm,
      minWidth: 120,
    },
    row: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#475569',
      backgroundColor: 'transparent',
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
  
  // Admin styles
  adminContainer: {
    flex: 1,
    backgroundColor: colors.adminBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.adminBackground,
  },
  adminContent: {
    flex: 1,
  },
  adminSection: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  adminSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  adminMenuSection: {
    marginTop: spacing.lg,
  },
}); 