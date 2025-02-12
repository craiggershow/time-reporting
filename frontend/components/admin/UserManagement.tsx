import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { buildApiUrl } from '@/constants/Config';
import { DataTable } from '../ui/DataTable';
import { UserForm } from './UserForm';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isActive: boolean;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(buildApiUrl('USERS'), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { 
      key: 'isAdmin', 
      title: 'Admin',
      render: (value: boolean) => value ? 'Yes' : 'No'
    },
    { 
      key: 'isActive', 
      title: 'Status',
      render: (value: boolean) => value ? 'Active' : 'Inactive'
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, user: User) => (
        <View style={styles.actions}>
          <Button 
            variant="secondary"
            onPress={() => setSelectedUser(user)}
          >
            Edit
          </Button>
        </View>
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">User Management</ThemedText>
        <Button onPress={() => setShowAddUser(true)}>
          Add User
        </Button>
      </View>

      {error && (
        <View style={styles.error}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}

      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
      />

      {(showAddUser || selectedUser) && (
        <UserForm
          user={selectedUser}
          onClose={() => {
            setShowAddUser(false);
            setSelectedUser(null);
          }}
          onSave={() => {
            fetchUsers();
            setShowAddUser(false);
            setSelectedUser(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  error: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
  },
}); 