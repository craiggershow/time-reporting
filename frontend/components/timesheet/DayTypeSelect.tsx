import { View, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/context/ThemeContext';
import { DayType } from '@/types/timesheet';
import { useState, useEffect } from 'react';
import { isWeb } from '@/utils/platform';
import { ThemedText } from '../ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useWindowDimensions } from 'react-native';

// Add global style to remove focus outlines from select elements on web
if (isWeb() && typeof document !== 'undefined' && document !== null) {
  try {
    if (typeof document.createElement === 'function' && document.head) {
      const style = document.createElement('style');
      style.textContent = `
        select:focus, select:active {
          outline: none !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          border-color: #e2e8f0 !important;
          border-radius: 8px !important;
        }
      `;
      document.head.appendChild(style);
    }
  } catch (error) {
    console.warn('Error adding global style for select elements:', error);
  }
}

interface DayTypeSelectProps {
  value: DayType;
  onChange: (value: DayType) => void;
  disabled?: boolean;
}

const DAY_TYPES: { value: DayType; label: string }[] = [
  { value: 'regular', label: 'Regular' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'sick', label: 'Sick' },
];

export function DayTypeSelect({ value = 'regular', onChange, disabled }: DayTypeSelectProps) {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Get the label for the current value
  const getLabel = (value: DayType): string => {
    const type = DAY_TYPES.find(t => t.value === value);
    return type ? type.label : 'Regular';
  };

  const handleSelect = (newValue: DayType) => {
    onChange(newValue);
    setShowPicker(false);
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: '#ffffff', // White background
        borderColor: colors.border,
      },
      disabled && styles.disabledContainer
    ]}>
      {isMobile ? (
        <>
          <TouchableOpacity 
            style={styles.mobileSelector}
            onPress={disabled ? undefined : () => setShowPicker(true)}
            disabled={disabled}
          >
            <ThemedText style={styles.mobileText}>{getLabel(value)}</ThemedText>
            {!disabled && (
              <Ionicons name="chevron-down" size={16} color="#64748b" />
            )}
          </TouchableOpacity>

          <Modal
            visible={showPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>Select Day Type</ThemedText>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Ionicons name="close" size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.optionsContainer}>
                  {DAY_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.optionItem,
                        value === type.value && styles.selectedOption
                      ]}
                      onPress={() => handleSelect(type.value)}
                    >
                      <ThemedText style={[
                        styles.optionText,
                        value === type.value && styles.selectedOptionText
                      ]}>
                        {type.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={value}
            onValueChange={onChange}
            enabled={!disabled}
            style={[
              styles.picker, 
              { 
                color: '#1e293b',
                outlineWidth: 0,
              }
            ]} 
            dropdownIconColor="#1e293b" // Dark icon
            itemStyle={styles.pickerItem}
          >
            {DAY_TYPES.map((type) => (
              <Picker.Item
                key={type.value}
                label={type.label}
                value={type.value}
                color="#1e293b" // Dark text for dropdown items
              />
            ))}
          </Picker>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  pickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    width: 120,
    height: 40,
    textAlign: 'center',
    borderWidth: 0, // Remove default border
    borderRadius: 8, // Match container border radius
  },
  pickerItem: {
    textAlign: 'center',
  },
  // Mobile styles
  disabledContainer: {
    backgroundColor: '#f1f5f9',
    opacity: 0.7,
  },
  mobileSelector: {
    width: '100%',
    height: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileText: {
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionsContainer: {
    padding: 16,
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  selectedOption: {
    backgroundColor: '#f0f9ff',
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    fontWeight: '600',
    color: '#0ea5e9',
  },
}); 