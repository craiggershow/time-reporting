import { View, StyleSheet, TextInput, Switch } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { buildApiUrl } from '@/constants/Config';
import { Modal } from '../ui/Modal';
import { commonStyles } from '@/styles/common';

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

  const handleSubmit = async () => {
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
      <View 
        testID="user-form-container" 
        style={commonStyles.contentCard}
      >
        <ThemedText type="subtitle">
          {user ? 'Edit User' : 'Add User'}
        </ThemedText>

        {error && (
          <View 
            testID="user-form-error" 
            style={commonStyles.errorContainer}
          >
            <ThemedText style={commonStyles.errorMessage}>{error}</ThemedText>
          </View>
        )}

        <View 
          testID="user-form-fields" 
          style={commonStyles.formInputWrapper}
        >
          <View 
            testID="email-input-container" 
            style={commonStyles.formInputWrapper}
          >
            <ThemedText style={commonStyles.formLabel}>Email</ThemedText>
            <TextInput
              testID="email-input"
              style={commonStyles.formInput}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter email"
            />
          </View>

          <View style={commonStyles.formInputWrapper}>
            <ThemedText style={commonStyles.formLabel}>First Name</ThemedText>
            <TextInput
              style={commonStyles.formInput}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
            />
          </View>

          <View style={commonStyles.formInputWrapper}>
            <ThemedText style={commonStyles.formLabel}>Last Name</ThemedText>
            <TextInput
              style={commonStyles.formInput}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
            />
          </View>

          {!user && (
            <View style={commonStyles.formInputWrapper}>
              <ThemedText style={commonStyles.formLabel}>Password</ThemedText>
              <TextInput
                style={commonStyles.formInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Enter password"
              />
            </View>
          )}

          <View style={commonStyles.formInputWrapper}>
            <ThemedText style={commonStyles.formLabel}>Employee ID</ThemedText>
            <TextInput
              style={commonStyles.formInput}
              value={employeeId}
              onChangeText={setEmployeeId}
              placeholder="Auto-generated if empty"
            />
          </View>

          <View style={commonStyles.formInputWrapper}>
            <ThemedText style={commonStyles.formLabel}>Admin User</ThemedText>
            <Switch
              value={isAdmin}
              onValueChange={setIsAdmin}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isAdmin ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          <View style={commonStyles.formInputWrapper}>
            <ThemedText style={commonStyles.formLabel}>Active</ThemedText>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isActive ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>

        <View 
          testID="form-actions" 
          style={commonStyles.buttonContainer}
        >
          <Button 
            testID="cancel-button"
            variant="secondary" 
            onPress={onClose}
          >
            Cancel
          </Button>
          <Button 
            testID="save-button"
            onPress={handleSubmit} 
            isLoading={isLoading}
          >
            Save
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    width: '100%',
    maxWidth: 500,
  },
  form: {
    gap: 16,
    marginTop: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: '#4b5563',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  error: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
  },
  errorText: {
    color: '#dc2626',
  },
}); 