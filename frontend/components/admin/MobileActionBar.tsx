import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../ThemedText';

interface MobileActionBarProps {
  selectedCount: number;
  onAdd: () => void;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onExport: () => void;
  onClearSelection: () => void;
}

export function MobileActionBar({
  selectedCount,
  onAdd,
  onBulkActivate,
  onBulkDeactivate,
  onExport,
  onClearSelection,
}: MobileActionBarProps) {
  if (selectedCount > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.selectionInfo}>
          <ThemedText style={styles.selectionText}>{selectedCount} selected</ThemedText>
          <TouchableOpacity onPress={onClearSelection}>
            <ThemedText style={styles.clearText}>Clear</ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onBulkActivate}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#64748b" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={onBulkDeactivate}>
            <Ionicons name="close-circle-outline" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.exportButton} onPress={onExport}>
        <Ionicons name="download-outline" size={20} color="#64748b" />
        <ThemedText style={styles.buttonText}>Export</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Ionicons name="add" size={20} color="#ffffff" />
        <ThemedText style={styles.addButtonText}>Add User</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 12,
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginRight: 8,
  },
  clearText: {
    fontSize: 14,
    color: '#2563eb',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  buttonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#64748b',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
}); 