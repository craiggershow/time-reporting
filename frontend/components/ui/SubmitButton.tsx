import { View, StyleSheet, Pressable } from 'react-native';
import { useState } from 'react';
import { Button } from './Button';
import { ThemedText } from '../ThemedText';

interface SubmitButtonProps {
  onPress: () => void;
  isSubmitting: boolean;
  validationErrors: string[];
}

export function SubmitButton({ onPress, isSubmitting, validationErrors }: SubmitButtonProps) {
  const [showErrors, setShowErrors] = useState(false);

  const handlePress = () => {
    if (validationErrors.length > 0) {
      setShowErrors(true);
    } else {
      onPress();
    }
  };

  return (
    <View style={styles.container}>
      <Button
        onPress={handlePress}
        disabled={isSubmitting}
        loading={isSubmitting}
      >
        Submit Timesheet
      </Button>

      {showErrors && validationErrors.length > 0 && (
        <View style={styles.errorPopup}>
          <ThemedText style={styles.errorTitle}>Please fix the following errors:</ThemedText>
          {validationErrors.map((error, index) => (
            <ThemedText key={index} style={styles.errorText}>• {error}</ThemedText>
          ))}
          <Pressable 
            onPress={() => setShowErrors(false)}
            style={styles.closeButton}
          >
            <ThemedText style={styles.closeText}>Close</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  errorPopup: {
    position: 'absolute',
    top: -10,
    right: '100%',
    marginRight: 10,
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    width: 300,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginBottom: 4,
  },
  closeButton: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#dc2626',
    borderRadius: 4,
    alignItems: 'center',
  },
  closeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
}); 