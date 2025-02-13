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
      render: (id: string) => (
        <ThemedText style={styles.cellText}>
          {id}
        </ThemedText>
      ),
    },
    { 
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (_, user: User) => (
        <ThemedText style={styles.cellText}>
          {`${user.firstName} ${user.lastName}`}
        </ThemedText>
      ),
    },
    { 
      key: 'email',
      title: 'Email',
      sortable: true,
      render: (email: string) => (
        <ThemedText style={styles.cellText}>
          {email}
        </ThemedText>
      ),
    },
    { 
      key: 'role', 
      title: 'Admin',
      sortable: true,
      render: (role: string) => (
        <ThemedText style={styles.cellText}>
          {role === 'ADMIN' ? 'Yes' : 'No'}
        </ThemedText>
      ),
    },
    { 
      key: 'isActive', 
      title: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <View style={[styles.statusBadge, value ? styles.activeBadge : styles.inactiveBadge]}>
          <ThemedText style={value ? styles.activeText : styles.inactiveText}>
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
    <View 
      style={[
        styles.pageContainer,
        { backgroundColor: colors.adminBackground },
        Platform.select({
          web: {
            backgroundColor: colors.adminBackground,
            minHeight: '100vh',
          }
        })
      ]}
    >
      <Header />
      <ScrollView 
        style={[
          styles.content,
          { backgroundColor: colors.adminBackground }
        ]}
      >
        <View 
          style={[
            styles.section,
            { backgroundColor: colors.adminBackground }
          ]}
        >
          <View style={styles.headerCard}>
            <View style={styles.headerLeft}>
              <ThemedText type="title">User Management</ThemedText>
              <ThemedText style={styles.subtitle}>
                Manage user accounts and permissions
              </ThemedText>
            </View>
            <View style={styles.headerActions}>
              {selectedUserIds.length > 0 && (
                <View style={styles.bulkActions}>
                  <View style={styles.selectedBadge}>
                    <ThemedText style={styles.selectedCount}>
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
                onPress={handleExport}
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

          <View style={styles.filtersCard}>
            <View style={styles.searchSection}>
              <Input
                label=""
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                leftIcon={<Ionicons name="search" size={20} color={colors.text.secondary} />}
              />
              <ThemedText style={styles.resultCount}>
                {filteredUsers.length} users found
              </ThemedText>
            </View>

            <View style={styles.filterGroups}>
              <View style={styles.filterGroup}>
                <ThemedText style={styles.filterLabel}>Role</ThemedText>
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
                <ThemedText style={styles.filterLabel}>Status</ThemedText>
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

          <View style={styles.tableCard}>
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
              <ThemedText style={styles.paginationText}>
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
  pageContainer: {
    flex: 1,
    backgroundColor: colors.adminBackground,
    minHeight: '100%',
  },
  content: {
    flex: 1,
    backgroundColor: colors.adminBackground,
  },
  section: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.adminBackground,
  },
  headerCard: {
    ...commonStyles.contentCard,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    gap: spacing.xs,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filtersCard: {
    ...commonStyles.contentCard,
    gap: spacing.lg,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  searchInput: {
    flex: 1,
    maxWidth: 300,
  },
  resultCount: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  filterGroups: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  filterGroup: {
    gap: spacing.sm,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tableCard: {
    ...commonStyles.contentCard,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paginationText: {
    color: colors.text.secondary,
    minWidth: 100,
    textAlign: 'center',
  },
  bulkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectedBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  selectedCount: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  cellText: {
    color: colors.table.row.text,
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: colors.table.status.active.background,
  },
  inactiveBadge: {
    backgroundColor: colors.table.status.inactive.background,
  },
  activeText: {
    color: colors.table.status.active.text,
    fontSize: 14,
    fontWeight: '500',
  },
  inactiveText: {
    color: colors.table.status.inactive.text,
    fontSize: 14,
    fontWeight: '500',
  },
}); 