import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { buildApiUrl } from '@/constants/Config';
import { Modal } from '../ui/Modal';

interface UserFormProps {
  user?: {
    id: string;
    email: string;
    name: string;
    isAdmin: boolean;
    isActive: boolean;
  } | null;
  onClose: () => void;
  onSave: () => void;
}

export function UserForm({ user, onClose, onSave }: UserFormProps) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
    password: '',
    isAdmin: user?.isAdmin || false,
    isActive: user?.isActive ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    try {
      setIsLoading(true);
      setError(null);

      const url = user 
        ? buildApiUrl(`USERS/${user.id}`)
        : buildApiUrl('USERS');

      const response = await fetch(url, {
        method: user ? 'PUT' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save user');
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <View style={styles.container}>
        <ThemedText type="subtitle">
          {user ? 'Edit User' : 'Add New User'}
        </ThemedText>

        {error && (
          <View style={styles.error}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        <View style={styles.form}>
          <Input
            label="Name"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label={user ? "New Password (optional)" : "Password"}
            value={formData.password}
            onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
            secureTextEntry
          />

          <View style={styles.checkboxContainer}>
            <Checkbox
              label="Admin Access"
              value={formData.isAdmin}
              onChange={(value) => setFormData(prev => ({ ...prev, isAdmin: value }))}
            />
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox
              label="Active"
              value={formData.isActive}
              onChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
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
  checkboxContainer: {
    marginTop: 8,
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