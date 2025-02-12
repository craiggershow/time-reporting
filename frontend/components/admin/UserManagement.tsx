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
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EMPLOYEE';
  isActive: boolean;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const url = buildApiUrl('USERS');
      console.log('=== Fetching Users ===');
      console.log('URL:', url);
      console.log('Method: GET');
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('=== Error Response ===');
        console.error('Status:', response.status);
        console.error('Raw Response:', errorText);
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      console.log('=== Success Response ===');
      console.log('Users Count:', data.length);
      setUsers(data);
    } catch (error) {
      console.error('=== Fetch Error ===');
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { 
      key: 'name',
      title: 'Name',
      render: (_, user: User) => `${user.firstName} ${user.lastName}`
    },
    { 
      key: 'email',
      title: 'Email' 
    },
    { 
      key: 'role', 
      title: 'Admin',
      render: (role: string) => role === 'ADMIN' ? 'Yes' : 'No'
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
            setShowAddUser(false);
            setSelectedUser(null);
          }}
          fetchUsers={fetchUsers}
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