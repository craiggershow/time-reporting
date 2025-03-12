import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Button } from './Button';
import { Modal } from './Modal';
import { colors, spacing } from '@/styles/common';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <Modal onClose={onCancel}>
      <View style={[styles.container, isMobile && styles.mobileContainer]}>
        <ThemedText type="subtitle" style={[styles.title, isMobile && styles.mobileTitle]}>
          {title}
        </ThemedText>
        <ThemedText style={[styles.message, isMobile && styles.mobileMessage]}>
          {message}
        </ThemedText>
        <View style={[styles.actions, isMobile && styles.mobileActions]}>
          <Button
            variant="secondary"
            onPress={onCancel}
            style={[styles.button, isMobile && styles.mobileButton]}
            size={isMobile ? "medium" : undefined}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            onPress={onConfirm}
            style={[styles.button, isMobile && styles.mobileButton]}
            size={isMobile ? "medium" : undefined}
          >
            {confirmText}
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.appBackground,
    borderRadius: 8,
    width: '100%',
  },
  mobileContainer: {
    padding: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  mobileTitle: {
    fontSize: 20,
    marginBottom: spacing.md,
  },
  message: {
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    fontSize: 16,
  },
  mobileMessage: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  mobileActions: {
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  button: {
    minWidth: 100,
  },
  mobileButton: {
    minWidth: '48%',
    height: 48,
  },
}); 