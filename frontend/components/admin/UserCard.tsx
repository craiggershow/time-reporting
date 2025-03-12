import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../ThemedText';

interface User {
  id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EMPLOYEE';
  isActive: boolean;
}

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
}

export function UserCard({ user, onEdit, onToggleStatus, isSelected, onSelect }: UserCardProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.checkbox}
        onPress={() => onSelect(user.id, !isSelected)}
      >
        <View style={[styles.checkboxInner, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#ffffff" />}
        </View>
      </TouchableOpacity>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.name}>{user.firstName} {user.lastName}</ThemedText>
          <View style={[
            styles.statusBadge, 
            user.isActive ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <ThemedText style={user.isActive ? styles.activeText : styles.inactiveText}>
              {user.isActive ? 'Active' : 'Inactive'}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color="#64748b" style={styles.icon} />
            <ThemedText style={styles.detailText}>{user.email}</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="id-card-outline" size={16} color="#64748b" style={styles.icon} />
            <ThemedText style={styles.detailText}>ID: {user.employeeId}</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="shield-outline" size={16} color="#64748b" style={styles.icon} />
            <ThemedText style={styles.detailText}>
              {user.role === 'ADMIN' ? 'Admin' : 'Employee'}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onEdit(user)}
          >
            <Ionicons name="create-outline" size={20} color="#64748b" />
            <ThemedText style={styles.actionText}>Edit</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onToggleStatus(user)}
          >
            <Ionicons 
              name={user.isActive ? "close-circle-outline" : "checkmark-circle-outline"} 
              size={20} 
              color="#64748b" 
            />
            <ThemedText style={styles.actionText}>
              {user.isActive ? 'Deactivate' : 'Activate'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    marginRight: 12,
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    height: 20,
    width: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
  },
  inactiveBadge: {
    backgroundColor: '#fee2e2',
  },
  activeText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '500',
  },
  inactiveText: {
    color: '#991b1b',
    fontSize: 12,
    fontWeight: '500',
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4b5563',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#64748b',
  },
}); 