import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { ThemedText } from '../ThemedText';
import { buildApiUrl } from '@/constants/Config';
import { UserForm } from './UserForm';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { downloadFile } from '@/utils/platform';
import { MobileUserFilters } from './MobileUserFilters';
import { UserCard } from './UserCard';
import { MobileActionBar } from './MobileActionBar';
import { MobilePagination } from './MobilePagination';

interface User {
  id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EMPLOYEE';
  isActive: boolean;
}

export function MobileUserManagement() {
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
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
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

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, page, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  const handleSelectUser = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedUserIds(prev => [...prev, id]);
    } else {
      setSelectedUserIds(prev => prev.filter(userId => userId !== id));
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
  };

  if (isLoading && !users.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <ThemedText style={styles.loadingText}>Loading users...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Users</ThemedText>
        <ThemedText style={styles.subtitle}>
          {filteredUsers.length} users found
        </ThemedText>
      </View>

      <MobileUserFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={clearFilters}
      />

      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}

      <FlatList
        data={paginatedUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onEdit={setSelectedUser}
            onToggleStatus={handleToggleUserStatus}
            isSelected={selectedUserIds.includes(item.id)}
            onSelect={handleSelectUser}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No users found</ThemedText>
          </View>
        }
      />

      {totalPages > 1 && (
        <MobilePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      <MobileActionBar
        selectedCount={selectedUserIds.length}
        onAdd={() => setShowAddUser(true)}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onExport={handleExportCSV}
        onClearSelection={() => setSelectedUserIds([])}
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
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  subtitle: {
    color: '#64748b',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#b91c1c',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for bottom navigation
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  emptyText: {
    color: '#64748b',
  },
}); 