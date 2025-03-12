import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../ThemedText';
import { Button } from '../ui/Button';

interface MobileUserFiltersProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  roleFilter: 'ALL' | 'ADMIN' | 'EMPLOYEE';
  onRoleFilterChange: (role: 'ALL' | 'ADMIN' | 'EMPLOYEE') => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  onStatusFilterChange: (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  onClearFilters: () => void;
}

export function MobileUserFilters({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
}: MobileUserFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  
  const hasActiveFilters = roleFilter !== 'ALL' || statusFilter !== 'ALL';

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor="#94a3b8"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity 
        style={[styles.filterButton, hasActiveFilters && styles.activeFilterButton]} 
        onPress={() => setShowFilters(true)}
      >
        <Ionicons 
          name="options-outline" 
          size={20} 
          color={hasActiveFilters ? "#ffffff" : "#64748b"} 
        />
      </TouchableOpacity>

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Filters</ThemedText>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <ThemedText style={styles.filterLabel}>Role</ThemedText>
              <View style={styles.filterOptions}>
                <TouchableOpacity 
                  style={[styles.filterOption, roleFilter === 'ALL' && styles.activeOption]}
                  onPress={() => onRoleFilterChange('ALL')}
                >
                  <ThemedText style={roleFilter === 'ALL' ? styles.activeOptionText : styles.optionText}>All</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterOption, roleFilter === 'ADMIN' && styles.activeOption]}
                  onPress={() => onRoleFilterChange('ADMIN')}
                >
                  <ThemedText style={roleFilter === 'ADMIN' ? styles.activeOptionText : styles.optionText}>Admin</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterOption, roleFilter === 'EMPLOYEE' && styles.activeOption]}
                  onPress={() => onRoleFilterChange('EMPLOYEE')}
                >
                  <ThemedText style={roleFilter === 'EMPLOYEE' ? styles.activeOptionText : styles.optionText}>Employee</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterSection}>
              <ThemedText style={styles.filterLabel}>Status</ThemedText>
              <View style={styles.filterOptions}>
                <TouchableOpacity 
                  style={[styles.filterOption, statusFilter === 'ALL' && styles.activeOption]}
                  onPress={() => onStatusFilterChange('ALL')}
                >
                  <ThemedText style={statusFilter === 'ALL' ? styles.activeOptionText : styles.optionText}>All</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterOption, statusFilter === 'ACTIVE' && styles.activeOption]}
                  onPress={() => onStatusFilterChange('ACTIVE')}
                >
                  <ThemedText style={statusFilter === 'ACTIVE' ? styles.activeOptionText : styles.optionText}>Active</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterOption, statusFilter === 'INACTIVE' && styles.activeOption]}
                  onPress={() => onStatusFilterChange('INACTIVE')}
                >
                  <ThemedText style={statusFilter === 'INACTIVE' ? styles.activeOptionText : styles.optionText}>Inactive</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button 
                variant="secondary" 
                onPress={() => {
                  onClearFilters();
                  setShowFilters(false);
                }}
              >
                Clear Filters
              </Button>
              <Button 
                onPress={() => setShowFilters(false)}
              >
                Apply
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1e293b',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeFilterButton: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#1e293b',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  activeOption: {
    backgroundColor: '#2563eb',
  },
  optionText: {
    color: '#64748b',
  },
  activeOptionText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
}); 