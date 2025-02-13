import { View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { buildApiUrl } from '@/constants/Config';
import { DataTable } from '../ui/DataTable';
import { UserForm } from './UserForm';
import { commonStyles } from '@/styles/common';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface User {
  id: string;
  employeeId: string;
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);

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

  const handleToggleUserStatus = (user: User) => {
    setUserToDeactivate(user);
    setShowConfirmDialog(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!userToDeactivate) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${buildApiUrl('USERS')}/${userToDeactivate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          ...userToDeactivate, 
          isActive: !userToDeactivate.isActive 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${userToDeactivate.isActive ? 'deactivate' : 'activate'} user`);
      }

      await fetchUsers();
    } catch (error) {
      setError(error instanceof Error ? error.message : `Failed to ${userToDeactivate.isActive ? 'deactivate' : 'activate'} user`);
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
      setUserToDeactivate(null);
    }
  };

  const columns = [
    { 
      key: 'employeeId',
      title: 'Id',
      sortable: true,
    },
    { 
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (_, user: User) => `${user.firstName} ${user.lastName}`
    },
    { 
      key: 'email',
      title: 'Email',
      sortable: true,
    },
    { 
      key: 'role', 
      title: 'Admin',
      sortable: true,
      render: (role: string) => role === 'ADMIN' ? 'Yes' : 'No'
    },
    { 
      key: 'isActive', 
      title: 'Status',
      sortable: true,
      render: (value: boolean) => value ? 'Active' : 'Inactive'
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, user: User) => (
        <View style={commonStyles.actions}>
          <Button 
            variant="secondary"
            onPress={() => setSelectedUser(user)}
          >
            Edit
          </Button>
          <Button 
            variant={user.isActive ? "secondary" : "primary"}
            onPress={() => handleToggleUserStatus(user)}
          >
            {user.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </View>
      ),
    },
  ];

  if (isLoading && !users.length) {
    return (
      <View testID="user-management-loading" style={commonStyles.pageContainer}>
        <LoadingSpinner message="Loading users..." />
      </View>
    );
  }

  return (
    <View testID="user-management-page" style={commonStyles.pageContainer}>
      <View testID="user-management-header" style={commonStyles.pageHeader}>
        <ThemedText type="subtitle">User Management</ThemedText>
        <Button onPress={() => setShowAddUser(true)}>
          Add User
        </Button>
      </View>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchUsers}
          onDismiss={() => setError(null)}
        />
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

      {showConfirmDialog && userToDeactivate && (
        <ConfirmDialog
          title={userToDeactivate.isActive ? "Deactivate User" : "Activate User"}
          message={`Are you sure you want to ${userToDeactivate.isActive ? 'deactivate' : 'activate'} ${userToDeactivate.firstName} ${userToDeactivate.lastName}?`}
          confirmText={userToDeactivate.isActive ? "Deactivate" : "Activate"}
          isDestructive={userToDeactivate.isActive}
          onConfirm={handleConfirmStatusChange}
          onCancel={() => {
            setShowConfirmDialog(false);
            setUserToDeactivate(null);
          }}
        />
      )}
    </View>
  );
} 