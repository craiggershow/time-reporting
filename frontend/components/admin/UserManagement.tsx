import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { buildApiUrl } from '@/constants/Config';
import { DataTable } from '../ui/DataTable';
import { UserForm } from './UserForm';
import { commonStyles, colors, spacing } from '@/styles/common';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../layout/Header';
import { useRouter } from 'expo-router';
import { downloadFile } from '@/utils/platform';

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
  const router = useRouter();

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
      console.log('UserData', data);
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
      width: 100,
      render: (id: string) => (
        <ThemedText style={styles.text.cell}>
          {id}
        </ThemedText>
      ),
    },
    { 
      key: 'name',
      title: 'Name',
      sortable: true,
      width: 200,
      render: (_, user: User) => (
        <ThemedText style={styles.text.cell}>
          {`${user.firstName} ${user.lastName}`}
        </ThemedText>
      ),
    },
    { 
      key: 'email',
      title: 'Email',
      sortable: true,
      width: 400,
      render: (email: string) => (
        <View style={{ width: 400 }}>
          <ThemedText style={{
            ...styles.text.cell, 
            width: '100%',
            textAlign: 'center'  // Center the email text
          }}>
            {email}
          </ThemedText>
        </View>
      ),
    },
    { 
      key: 'role', 
      title: 'Admin',
      sortable: true,
      render: (role: string) => (
        <ThemedText style={styles.text.cell}>
          {role === 'ADMIN' ? 'Yes' : 'No'}
        </ThemedText>
      ),
    },
    { 
      key: 'isActive', 
      title: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <View style={{
          ...styles.status.badge,
          ...(value ? styles.status.active : styles.status.inactive)
        }}>
          <ThemedText style={value ? styles.status.active : styles.status.inactive}>
            {value ? 'Active' : 'Inactive'}
          </ThemedText>
        </View>
      ),
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

  const handleExportCSV = () => {
    const csvContent = [
      ['ID', 'Employee ID', 'First Name', 'Last Name', 'Email', 'Role', 'Status'],
      ...filteredUsers.map(user => [
        user.id,
        user.employeeId,
        user.firstName,
        user.lastName,
        user.email,
        user.role,
        user.isActive ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    downloadFile(csvContent, 'users.csv', 'text/csv');
  };

  if (isLoading && !users.length) {
    return (
      <View testID="user-management-loading" style={commonStyles.pageContainer}>
        <LoadingSpinner message="Loading users..." />
      </View>
    );
  }

  return (
    <View 
      style={{
        ...styles.container,
        ...(Platform.OS === 'web' ? { backgroundColor: colors.adminBackground } : {})
      }}
    >
      <Header />
      <ScrollView 
        style={{
          ...styles.content,
          backgroundColor: colors.adminBackground
        }}
      >
        <View 
          style={{
            ...styles.section,
            backgroundColor: colors.adminBackground
          }}
        >
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <ThemedText type="title">User Management</ThemedText>
              <ThemedText style={styles.text.subtitle}>
                Manage user accounts and permissions
              </ThemedText>
            </View>
            <View style={styles.headerActions}>
              {selectedUserIds.length > 0 && (
                <View style={styles.bulkActions}>
                  <View style={styles.selectedBadge}>
                    <ThemedText style={styles.text.count}>
                      {selectedUserIds.length} selected
                    </ThemedText>
                  </View>
                  <Button 
                    variant="secondary"
                    onPress={handleBulkActivate}
                    leftIcon={<Ionicons name="checkmark-circle" size={20} />}
                  >
                    Activate
                  </Button>
                  <Button 
                    variant="secondary"
                    onPress={handleBulkDeactivate}
                    leftIcon={<Ionicons name="close-circle" size={20} />}
                  >
                    Deactivate
                  </Button>
                </View>
              )}
              <Button 
                variant="secondary"
                onPress={handleExportCSV}
                leftIcon={<Ionicons name="download-outline" size={20} />}
              >
                Export
              </Button>
              <Button
                onPress={() => setShowAddUser(true)}
                leftIcon={<Ionicons name="add" size={20} />}
              >
                Add User
              </Button>
            </View>
          </View>

          <View style={styles.filters}>
            <View style={styles.searchContainer}>
              <Input
                label=""
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                leftIcon={<Ionicons name="search" size={20} color={colors.text.secondary} />}
              />
              <ThemedText style={styles.text.count}>
                {filteredUsers.length} users found
              </ThemedText>
            </View>

            <View style={styles.filterSection}>
              <View style={styles.filterGroup}>
                <ThemedText style={styles.text.cell}>Role</ThemedText>
                <View style={styles.filterButtons}>
                  <Button
                    variant={roleFilter === 'ALL' ? 'primary' : 'secondary'}
                    onPress={() => setRoleFilter('ALL')}
                    size="small"
                  >
                    All
                  </Button>
                  <Button
                    variant={roleFilter === 'ADMIN' ? 'primary' : 'secondary'}
                    onPress={() => setRoleFilter('ADMIN')}
                    size="small"
                  >
                    Admins
                  </Button>
                  <Button
                    variant={roleFilter === 'EMPLOYEE' ? 'primary' : 'secondary'}
                    onPress={() => setRoleFilter('EMPLOYEE')}
                    size="small"
                  >
                    Employees
                  </Button>
                </View>
              </View>

              <View style={styles.filterGroup}>
                <ThemedText style={styles.text.cell}>Status</ThemedText>
                <View style={styles.filterButtons}>
                  <Button
                    variant={statusFilter === 'ALL' ? 'primary' : 'secondary'}
                    onPress={() => setStatusFilter('ALL')}
                    size="small"
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === 'ACTIVE' ? 'primary' : 'secondary'}
                    onPress={() => setStatusFilter('ACTIVE')}
                    size="small"
                  >
                    Active
                  </Button>
                  <Button
                    variant={statusFilter === 'INACTIVE' ? 'primary' : 'secondary'}
                    onPress={() => setStatusFilter('INACTIVE')}
                    size="small"
                  >
                    Inactive
                  </Button>
                </View>
              </View>
            </View>
          </View>

          {error && (
            <ErrorMessage
              message={error}
              onRetry={fetchUsers}
              onDismiss={() => setError(null)}
            />
          )}

          <View style={styles.table}>
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
                size="small"
                leftIcon={<Ionicons name="chevron-back" size={16} />}
              >
                Previous
              </Button>
              <ThemedText style={styles.text.count}>
                Page {page} of {totalPages}
              </ThemedText>
              <Button
                variant="secondary"
                onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                size="small"
                rightIcon={<Ionicons name="chevron-forward" size={16} />}
              >
                Next
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>

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
  container: commonStyles.adminPage,
  content: commonStyles.adminContent,
  section: commonStyles.adminSection,
  header: commonStyles.adminCard,
  headerInfo: {
    gap: spacing.xs,
  },
  filters: commonStyles.adminFilters,
  searchContainer: commonStyles.adminSearch.container,
  searchInput: commonStyles.adminSearch.input,
  filterSection: commonStyles.adminFilterGroup.section,
  filterGroup: commonStyles.adminFilterGroup.group,
  filterButtons: commonStyles.adminFilterGroup.buttons,
  table: commonStyles.adminTable.container,
  bulkActions: commonStyles.adminActions.bulk,
  selectedBadge: commonStyles.adminActions.selectedBadge,
  text: commonStyles.adminText,
  status: commonStyles.adminStatus,
  pagination: commonStyles.adminTable.pagination,
}); 