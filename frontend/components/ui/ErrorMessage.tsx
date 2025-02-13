import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/styles/common';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onRetry, onDismiss }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="alert-circle" size={24} color={colors.status.error} />
        <ThemedText style={styles.message}>{message}</ThemedText>
      </View>
      <View style={styles.actions}>
        {onRetry && (
          <Pressable onPress={onRetry} style={styles.retryButton}>
            <Ionicons name="refresh" size={20} color={colors.text.light} />
            <ThemedText style={styles.buttonText}>Retry</ThemedText>
          </Pressable>
        )}
        {onDismiss && (
          <Pressable onPress={onDismiss} style={styles.dismissButton}>
            <Ionicons name="close" size={20} color={colors.text.light} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(254, 226, 226, 0.1)',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  message: {
    color: colors.status.error,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  dismissButton: {
    padding: spacing.xs,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonText: {
    color: colors.text.light,
  },
}); 