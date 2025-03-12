import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  Switch, 
  Platform, 
  Modal, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
  Text
} from 'react-native';
import { ThemedText } from '../ThemedText';
import { Button } from '../ui/Button';
import { buildApiUrl } from '@/constants/Config';
import { Ionicons } from '@expo/vector-icons';
import { ErrorMessage } from '../ui/ErrorMessage';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EMPLOYEE';
  isActive: boolean;
  employeeId: string;
}

interface MobileUserFormProps {
  user?: User | null;
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  fetchUsers: () => Promise<void>;
}

export function MobileUserForm({ 
  user, 
  visible, 
  onClose, 
  onSave, 
  fetchUsers 
}: MobileUserFormProps) {
  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(user?.role === 'ADMIN');
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState(user?.employeeId || '');

  // Update form values when user changes
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setIsAdmin(user.role === 'ADMIN');
      setIsActive(user.isActive ?? true);
      setEmployeeId(user.employeeId || '');
    } else {
      setEmail('');
      setFirstName('');
      setLastName('');
      setPassword('');
      setIsAdmin(false);
      setIsActive(true);
      setEmployeeId('');
    }
  }, [user]);

  const validateForm = (): string | null => {
    if (!email) return 'Email is required';
    if (!email.includes('@')) return 'Invalid email format';
    if (!firstName) return 'First name is required';
    if (!lastName) return 'Last name is required';
    if (!user && !password) return 'Password is required for new users';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = {
        email,
        firstName,
        lastName,
        ...(password && { password }),
        role: isAdmin ? 'ADMIN' : 'EMPLOYEE',
        isActive,
        employeeId,
      };

      const url = user 
        ? `${buildApiUrl('USERS')}/${user.id}`
        : buildApiUrl('USERS');

      const response = await fetch(url, {
        method: user ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save user');
      }

      await fetchUsers();
      onSave();
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {user ? 'Edit User' : 'Add User'}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => setError(null)}>
                  <Ionicons name="close-circle" size={20} color="#b91c1c" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.formFields}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter email"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Enter first name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Enter last name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {!user && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="Enter password"
                    autoCapitalize="none"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Employee ID</Text>
                <TextInput
                  style={styles.input}
                  value={employeeId}
                  onChangeText={setEmployeeId}
                  placeholder="Auto-generated if empty"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.label}>Admin User</Text>
                <Switch
                  value={isAdmin}
                  onValueChange={setIsAdmin}
                  trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                  thumbColor={'#ffffff'}
                  ios_backgroundColor="#d1d5db"
                />
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.label}>Active</Text>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                  thumbColor={'#ffffff'}
                  ios_backgroundColor="#d1d5db"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    height: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  closeButton: {
    padding: 8,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  formFields: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#ffffff',
    height: 54,
    color: '#1e293b',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  cancelButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#93c5fd',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#b91c1c',
    flex: 1,
  },
}); 