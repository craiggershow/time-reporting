import { View, StyleSheet, TextInput, Switch } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { buildApiUrl } from '@/constants/Config';
import { Modal } from '../ui/Modal';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EMPLOYEE';
  isActive: boolean;
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

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = {
        email,
        firstName,
        lastName,
        ...(password && { password }), // Only include if password is set
        role: isAdmin ? 'ADMIN' : 'EMPLOYEE',
        isActive,
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save user');
      }

      await fetchUsers();
      onSave();
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error instanceof Error ? error.message : 'Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <View style={styles.container}>
        <ThemedText type="subtitle">
          {user ? 'Edit User' : 'Add User'}
        </ThemedText>

        {error && (
          <View style={styles.error}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter email"
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
              />
            </View>
          )}

          <View style={styles.switchContainer}>
            <ThemedText>Admin User</ThemedText>
            <Switch
              value={isAdmin}
              onValueChange={setIsAdmin}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isAdmin ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchContainer}>
            <ThemedText>Active</ThemedText>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isActive ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            variant="secondary"
            onPress={onClose}
          >
            Cancel
          </Button>
          <Button
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