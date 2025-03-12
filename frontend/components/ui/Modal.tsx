import { View, StyleSheet, Pressable, Modal as RNModal, useWindowDimensions, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/styles/common';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export function Modal({ children, onClose }: ModalProps) {
  const { colors: themeColors } = useTheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 768;

  return (
    <RNModal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable 
            style={[
              styles.content, 
              { backgroundColor: themeColors.background.card || '#ffffff' },
              isMobile && styles.mobileContent,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#000000" />
            </Pressable>
            {children}
          </Pressable>
        </Pressable>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  content: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  mobileContent: {
    width: '95%',
    padding: 16,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 