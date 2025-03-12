import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../ThemedText';

interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function MobilePagination({
  currentPage,
  totalPages,
  onPageChange,
}: MobilePaginationProps) {
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
        onPress={goToPreviousPage}
        disabled={currentPage === 1}
      >
        <Ionicons
          name="chevron-back"
          size={20}
          color={currentPage === 1 ? '#94a3b8' : '#64748b'}
        />
        <ThemedText
          style={[styles.buttonText, currentPage === 1 && styles.disabledText]}
        >
          Previous
        </ThemedText>
      </TouchableOpacity>

      <View style={styles.pageInfo}>
        <ThemedText style={styles.pageText}>
          {currentPage} / {totalPages}
        </ThemedText>
      </View>

      <TouchableOpacity
        style={[
          styles.pageButton,
          currentPage === totalPages && styles.disabledButton,
        ]}
        onPress={goToNextPage}
        disabled={currentPage === totalPages}
      >
        <ThemedText
          style={[
            styles.buttonText,
            currentPage === totalPages && styles.disabledText,
          ]}
        >
          Next
        </ThemedText>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={currentPage === totalPages ? '#94a3b8' : '#64748b'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  disabledButton: {
    backgroundColor: '#f8fafc',
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 14,
    color: '#64748b',
    marginHorizontal: 4,
  },
  disabledText: {
    color: '#94a3b8',
  },
  pageInfo: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pageText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
}); 