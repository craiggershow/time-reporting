import { View, StyleSheet, TextInput, Switch, Platform, useWindowDimensions } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { buildApiUrl } from '@/constants/Config';
import { Modal } from '../ui/Modal';
import { commonStyles } from '@/styles/common';
import { ErrorMessage } from '../ui/ErrorMessage';
import { KeyboardAvoidingView, ScrollView } from 'react-native';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EMPLOYEE';
  isActive: boolean;
  employeeId: string;
}

interface UserFormProps {
  user?: User | null;
  onClose: () => void;
  onSave: () => void;
  fetchUsers: () => Promise<void>;
}

export function UserForm({ user, onClose, onSave, fetchUsers }: UserFormProps) {
  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(user?.role === 'ADMIN');
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState(user?.employeeId || '');
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

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
    <Modal onClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.formHeader}>
            <ThemedText type="subtitle" style={styles.formTitle}>
              {user ? 'Edit User' : 'Add User'}
            </ThemedText>
          </View>

          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => setError(null)}
            />
          )}

          <View style={styles.formFields}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter email"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>First Name</ThemedText>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Last Name</ThemedText>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
              />
            </View>

            {!user && (
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Enter password"
                  autoCapitalize="none"
                  textContentType="password"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Employee ID</ThemedText>
              <TextInput
                style={styles.input}
                value={employeeId}
                onChangeText={setEmployeeId}
                placeholder="Auto-generated if empty"
              />
            </View>

            <View style={styles.switchContainer}>
              <ThemedText style={styles.label}>Admin User</ThemedText>
              <Switch
                value={isAdmin}
                onValueChange={setIsAdmin}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isAdmin ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>

            <View style={styles.switchContainer}>
              <ThemedText style={styles.label}>Active</ThemedText>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isActive ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button 
              variant="secondary" 
              onPress={onClose}
              style={styles.button}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleSubmit} 
              disabled={isLoading}
              style={styles.button}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  formHeader: {
    marginBottom: 16,
    paddingTop: 8,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  formFields: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
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
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    height: 48,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    height: 48,
  },
}); 