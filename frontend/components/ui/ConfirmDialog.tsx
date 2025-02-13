import { View, StyleSheet } from 'react-native';
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
  return (
    <Modal onClose={onCancel}>
      <View style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText style={styles.message}>{message}</ThemedText>
        <View style={styles.actions}>
          <Button
            variant="secondary"
            onPress={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            onPress={onConfirm}
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
    padding: spacing.lg,
    backgroundColor: colors.appBackground,
    borderRadius: 8,
    maxWidth: 400,
    width: '100%',
  },
  title: {
    marginBottom: spacing.sm,
    color: colors.text.light,
  },
  message: {
    color: colors.text.lightSecondary,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
}); 