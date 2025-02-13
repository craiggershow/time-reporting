import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { buildApiUrl } from '@/constants/Config';
import { DataTable } from '../ui/DataTable';
import { UserForm } from './UserForm';
import { commonStyles } from '@/styles/common';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Ionicons } from '@expo/vector-icons';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'EMPLOYEE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | null>(null);

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

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUserIds.length === 0) return;

    try {
      setIsLoading(true);
      const isActivating = bulkAction === 'activate';
      
      await Promise.all(selectedUserIds.map(userId => 
        fetch(`${buildApiUrl('USERS')}/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ isActive: isActivating }),
        })
      ));

      await fetchUsers();
      setSelectedUserIds([]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update users');
    } finally {
      setIsLoading(false);
      setShowBulkActionDialog(false);
      setBulkAction(null);
    }
  };

  const handleBulkActivate = () => {
    setBulkAction('activate');
    setShowBulkActionDialog(true);
  };

  const handleBulkDeactivate = () => {
    setBulkAction('deactivate');
    setShowBulkActionDialog(true);
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

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchQuery.toLowerCase().split(' ').every(term =>
        `${user.firstName} ${user.lastName} ${user.email} ${user.employeeId}`
          .toLowerCase()
          .includes(term)
      );

      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || 
        (statusFilter === 'ACTIVE' ? user.isActive : !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Pagination
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, page, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Name', 'Email', 'Role', 'Status'],
      ...filteredUsers.map(user => [
        user.employeeId,
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.role,
        user.isActive ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
        <View style={styles.headerActions}>
          {selectedUserIds.length > 0 && (
            <View style={styles.bulkActions}>
              <ThemedText style={styles.selectedCount}>
                {selectedUserIds.length} selected
              </ThemedText>
              <Button 
                variant="secondary"
                onPress={handleBulkActivate}
              >
                Activate Selected
              </Button>
              <Button 
                variant="secondary"
                onPress={handleBulkDeactivate}
              >
                Deactivate Selected
              </Button>
            </View>
          )}
          <Button onPress={handleExport} variant="secondary">
            <Ionicons name="download-outline" size={20} />
            Export
          </Button>
          <Button onPress={() => setShowAddUser(true)}>
            Add User
          </Button>
        </View>
      </View>

      <View style={styles.filters}>
        <Input
          label=""
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          leftIcon={<Ionicons name="search" size={20} color="#64748b" />}
        />

        <View style={styles.filterButtons}>
          <Button
            variant={roleFilter === 'ALL' ? 'primary' : 'secondary'}
            onPress={() => setRoleFilter('ALL')}
          >
            All Roles
          </Button>
          <Button
            variant={roleFilter === 'ADMIN' ? 'primary' : 'secondary'}
            onPress={() => setRoleFilter('ADMIN')}
          >
            Admins
          </Button>
          <Button
            variant={roleFilter === 'EMPLOYEE' ? 'primary' : 'secondary'}
            onPress={() => setRoleFilter('EMPLOYEE')}
          >
            Employees
          </Button>
        </View>

        <View style={styles.filterButtons}>
          <Button
            variant={statusFilter === 'ALL' ? 'primary' : 'secondary'}
            onPress={() => setStatusFilter('ALL')}
          >
            All Status
          </Button>
          <Button
            variant={statusFilter === 'ACTIVE' ? 'primary' : 'secondary'}
            onPress={() => setStatusFilter('ACTIVE')}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === 'INACTIVE' ? 'primary' : 'secondary'}
            onPress={() => setStatusFilter('INACTIVE')}
          >
            Inactive
          </Button>
        </View>
      </View>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchUsers}
          onDismiss={() => setError(null)}
        />
      )}

      <DataTable
        data={paginatedUsers}
        columns={columns}
        isLoading={isLoading}
        selectedIds={selectedUserIds}
        onSelectionChange={setSelectedUserIds}
      />

      <View style={styles.pagination}>
        <Button
          variant="secondary"
          onPress={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <ThemedText>
          Page {page} of {totalPages}
        </ThemedText>
        <Button
          variant="secondary"
          onPress={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </View>

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

      {showBulkActionDialog && (
        <ConfirmDialog
          title={`${bulkAction === 'activate' ? 'Activate' : 'Deactivate'} Users`}
          message={`Are you sure you want to ${bulkAction} ${selectedUserIds.length} users?`}
          confirmText={bulkAction === 'activate' ? 'Activate' : 'Deactivate'}
          isDestructive={bulkAction === 'deactivate'}
          onConfirm={handleBulkAction}
          onCancel={() => {
            setShowBulkActionDialog(false);
            setBulkAction(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  filters: {
    gap: 16,
    marginBottom: 24,
  },
  searchInput: {
    maxWidth: 300,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
  },
  bulkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedCount: {
    color: '#64748b',
    fontSize: 14,
  },
}); 