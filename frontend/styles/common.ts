import { StyleSheet, Platform } from 'react-native';

// Base colors without dependencies
const baseColors = {
  primary: '#2563eb',
  secondary: '#64748b',
  background: '#ffffff',
  surface: '#f8fafc',
  border: '#e2e8f0',
  tint: '#2563eb',
  inputBackground: '#ffffff',
  error: '#dc2626',
  success: '#22c55e',
  warning: '#f59e0b',
};

// Color palette with organized structure
export const colors = {
  primary: baseColors.primary,
  secondary: baseColors.secondary,
  tint: baseColors.tint,
  border: baseColors.border,
  error: baseColors.error,
  success: baseColors.success,
  warning: baseColors.warning,
  
  background: {
    page: baseColors.background,
    card: baseColors.surface,
    input: baseColors.inputBackground,
  },
  
  text: {
    primary: '#000000',
    secondary: '#4b5563',
    error: '#dc2626',
    light: '#ffffff',
    lightSecondary: '#cbd5e1',
  },

  input: {
    border: '#d1d5db',
    background: baseColors.inputBackground,
  },

  status: {
    success: baseColors.success,
    error: baseColors.error,
    warning: baseColors.warning,
  },

  button: {
    primary: {
      background: baseColors.primary,
      text: '#ffffff',
    },
    secondary: {
      background: '#f1f5f9',
      text: '#1e293b',
      border: baseColors.border,
    },
    danger: {
      background: baseColors.error,
      text: '#ffffff',
    },
  },

  modal: {
    overlay: 'rgba(0, 0, 0, 0.5)',
    background: '#ffffff',
  },

  table: {
    header: {
      background: '#f8fafc',
      text: '#000000',
      border: '#cbd5e1',  // Darker border color
    },
    row: {
      background: '#ffffff',
      alternateBackground: '#f8fafc',
      border: '#cbd5e1',  // Darker border color
      boarderBottomWidth: 50,
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

// First define base styles that don't depend on commonStyles
const baseStyles = {
  card: {
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
    ...baseStyles.card,
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
    backgroundColor: '#ffffff',
    color: colors.text.primary,
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
  
  // Admin Layout Patterns
  adminPage: {
    flex: 1,
    backgroundColor: colors.adminBackground,
    ...Platform.select({
      web: {
        minHeight: '100vh',
      }
    })
  },
  adminContent: {
    flex: 1,
    backgroundColor: colors.adminBackground,
  },
  adminSection: {
    padding: spacing.lg,
    gap: spacing.lg,
  },

  // Admin Cards
  adminCard: {
    ...baseStyles.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminFilters: {
    ...baseStyles.card,
    gap: spacing.lg,
  },

  // Admin Text Styles
  adminText: {
    subtitle: {
      color: colors.text.secondary,
      fontSize: 14,
    },
    count: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '500',
    },
    cell: {
      color: colors.text.primary,
      fontSize: 14,
    },
  },

  // Admin Status Badges
  adminStatus: {
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    active: {
      backgroundColor: colors.table.status.active.background,
      color: colors.table.status.active.text,
    },
    inactive: {
      backgroundColor: colors.table.status.inactive.background,
      color: colors.table.status.inactive.text,
    },
  },

  // Admin Filter Components
  adminSearch: {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    input: {
      flex: 1,
      maxWidth: 300,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: colors.input.border,
      borderRadius: 6,
      padding: spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
  },
  adminFilterGroup: {
    section: {
      flexDirection: 'row',
      gap: spacing.xl,
    },
    group: {
      gap: spacing.sm,
    },
    buttons: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
  },

  // Admin Actions
  adminActions: {
    bulk: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    selectedBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 16,
    },
  },

  // Admin Table
  adminTable: {
    container: {
      ...baseStyles.card,
    },
    header: {
      flexDirection: 'row',
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
      backgroundColor: baseColors.tableHeaderBackground,
    },
    headerCell: {
      padding: spacing.sm,
      minWidth: 120,
      alignItems: 'center',
      justifyContent: 'center',
      color: baseColors.textLight,
      flex: 0,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    headerText: {
      color: baseColors.textLight,
      fontWeight: '500',
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
    },
    cell: {
      padding: spacing.sm,
      minWidth: 120,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 0,
      paddingHorizontal: spacing.sm,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.lg,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  },
}); 