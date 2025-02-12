import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export function Modal({ children, onClose }: ModalProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    width: '100%',
    maxWidth: 600,
    borderRadius: 12,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
}); 