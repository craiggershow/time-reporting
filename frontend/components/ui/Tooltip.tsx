import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';

interface TooltipProps {
  message: string;
}

export function Tooltip({ message }: TooltipProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.text}>{message}</ThemedText>
      </View>
      <View style={styles.arrow} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -120,
    left: '50%',
    transform: [{ translateX: -100 }],
    width: 200,
    zIndex: 1000,
  },
  content: {
    backgroundColor: '#1e293b',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  arrow: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -4,
    width: 8,
    height: 8,
    backgroundColor: '#1e293b',
    transform: [{ rotate: '45deg' }],
  },
  text: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
}); 