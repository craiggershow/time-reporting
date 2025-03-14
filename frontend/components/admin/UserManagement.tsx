import { View, StyleSheet, ScrollView, Platform, useWindowDimensions, TouchableOpacity } from 'react-native';
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
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

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

  const columns = useMemo(() => {
    const baseColumns = [
    { 
      key: 'employeeId',
      title: 'Id',
      sortable: true,
        width: isMobile ? 60 : 100,
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
        width: isMobile ? 120 : 200,
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
        width: isMobile ? 150 : 400,
      render: (email: string) => (
          <View style={{ width: isMobile ? 150 : 400 }}>
            <ThemedText style={{
              ...styles.text.cell, 
              width: '100%',
              textAlign: 'center',
              ...(isMobile && { fontSize: 12 })
            }}>
            {email}
          </ThemedText>
        </View>
      ),
    },
    ];

    if (!isMobile) {
      baseColumns.push(
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
        }
      );
    }

    baseColumns.push({
      key: 'actions',
      title: 'Actions',
      width: isMobile ? 100 : undefined,
      render: (_: any, user: User) => (
        <View style={isMobile ? styles.mobileActions : commonStyles.actions}>
          <Button 
            variant="secondary"
            onPress={() => setSelectedUser(user)}
            size={isMobile ? "small" : undefined}
          >
            {isMobile ? <Ionicons name="create-outline" size={16} color="#64748b" /> : "Edit"}
          </Button>
          {!isMobile && (
          <Button 
            variant={user.isActive ? "secondary" : "primary"}
            onPress={() => handleToggleUserStatus(user)}
          >
            {user.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          )}
          {isMobile && (
            <Button 
              variant={user.isActive ? "secondary" : "primary"}
              onPress={() => handleToggleUserStatus(user)}
              size="small"
            >
              {user.isActive ? 
                <Ionicons name="close-circle-outline" size={16} color="#64748b" /> : 
                <Ionicons name="checkmark-circle-outline" size={16} color="#ffffff" />
              }
            </Button>
          )}
        </View>
      ),
    });

    return baseColumns;
  }, [isMobile]);

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
    <SafeAreaView style={styles.safeArea}>
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
          contentContainerStyle={styles.scrollContent}
      >
        <View 
            style={{
              ...styles.section,
              backgroundColor: colors.adminBackground
            }}
          >
            <View style={isMobile ? styles.mobileHeader : styles.header}>
            <View style={styles.headerInfo}>
              <ThemedText type="title">User Management</ThemedText>
                {!isMobile && (
              <ThemedText style={styles.text.subtitle}>
                Manage user accounts and permissions
              </ThemedText>
                )}
            </View>
              <View style={isMobile ? styles.mobileHeaderActions : styles.headerActions}>
                {isMobile && (
                  <Button 
                    variant="secondary"
                    onPress={handleExportCSV}
                    style={styles.mobileIconButton}
                    leftIcon={<Ionicons name="download-outline" size={20} color="#64748b" />}
                  >
                    {}
                  </Button>
                )}
                {isMobile && (
                  <Button
                    onPress={() => setShowAddUser(true)}
                    leftIcon={<Ionicons name="add" size={20} color="#ffffff" />}
                    style={styles.mobileAddButton}
                  >
                    Add
                  </Button>
                )}
                {selectedUserIds.length > 0 && !isMobile && (
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
                {!isMobile && (
              <Button 
                variant="secondary"
                onPress={handleExportCSV}
                leftIcon={<Ionicons name="download-outline" size={20} />}
              >
                Export
              </Button>
                )}
                {!isMobile && (
              <Button
                onPress={() => setShowAddUser(true)}
                leftIcon={<Ionicons name="add" size={20} />}
              >
                Add User
              </Button>
                )}
              </View>
          </View>

            <View style={isMobile ? styles.mobileFilters : styles.filters}>
              <View style={[styles.searchContainer, isMobile && styles.mobileSearchContainer]}>
              <Input
                label=""
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                  style={[styles.searchInput, isMobile && styles.mobileSearchInput]}
                leftIcon={<Ionicons name="search" size={20} color={colors.text.secondary} />}
              />
                {!isMobile && (
              <ThemedText style={styles.text.count}>
                {filteredUsers.length} users found
              </ThemedText>
                )}
            </View>
              {isMobile && (
                <ThemedText style={[styles.text.count, { color: colors.text.secondary }]}>
                  {filteredUsers.length} users found
                </ThemedText>
              )}

              {!isMobile && (
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
              )}

              {isMobile && (
                <View style={styles.mobileFilterSection}>
                  <View style={styles.mobileFilterRow}>
                    <ThemedText style={styles.mobileFilterLabel}>Role:</ThemedText>
                    <View style={styles.mobileFilterButtons}>
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
                        Admin
                      </Button>
                      <Button
                        variant={roleFilter === 'EMPLOYEE' ? 'primary' : 'secondary'}
                        onPress={() => setRoleFilter('EMPLOYEE')}
                        size="small"
                      >
                        Emp
                      </Button>
            </View>
                  </View>
                  
                  <View style={styles.mobileFilterRow}>
                    <ThemedText style={styles.mobileFilterLabel}>Status:</ThemedText>
                    <View style={styles.mobileFilterButtons}>
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
              )}
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

              <View style={isMobile ? styles.mobilePagination : styles.pagination}>
              <Button
                variant="secondary"
                onPress={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                  size="medium"
                  style={isMobile ? styles.mobilePaginationButton : undefined}
                  leftIcon={<Ionicons name="chevron-back" size={20} color="#1e293b" />}
              >
                  {isMobile ? "Prev" : "Previous"}
              </Button>
              <ThemedText style={styles.text.count}>
                  {page}/{totalPages}
              </ThemedText>
              <Button
                variant="secondary"
                onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                  size="medium"
                  style={isMobile ? styles.mobilePaginationButton : undefined}
                  rightIcon={<Ionicons name="chevron-forward" size={20} color="#1e293b" />}
              >
                  {isMobile ? "Next" : "Next"}
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>

        {isMobile && (
          <TouchableOpacity 
            style={styles.floatingActionButton}
            onPress={() => setShowAddUser(true)}
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        )}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: commonStyles.adminPage,
  content: commonStyles.adminContent,
  scrollContent: {
    flexGrow: 1,
  },
  section: commonStyles.adminSection,
  header: commonStyles.adminCard,
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
  },
  headerInfo: {
    gap: spacing.xs,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mobileHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filters: commonStyles.adminFilters,
  mobileFilters: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  searchContainer: commonStyles.adminSearch.container,
  searchInput: commonStyles.adminSearch.input,
  filterSection: commonStyles.adminFilterGroup.section,
  mobileFilterSection: {
    marginTop: 8,
  },
  mobileFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mobileFilterLabel: {
    width: 60,
    fontSize: 14,
  },
  mobileFilterButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  filterGroup: commonStyles.adminFilterGroup.group,
  filterButtons: commonStyles.adminFilterGroup.buttons,
  table: commonStyles.adminTable.container,
  bulkActions: commonStyles.adminActions.bulk,
  selectedBadge: commonStyles.adminActions.selectedBadge,
  text: commonStyles.adminText,
  status: commonStyles.adminStatus,
  pagination: commonStyles.adminTable.pagination,
  mobilePagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  mobileActions: {
    flexDirection: 'row',
    gap: 4,
  },
  mobileAddButton: {
    paddingHorizontal: 12,
    height: 40,
    minWidth: 80,
  },
  mobileIconButton: {
    width: 40,
    height: 40,
    paddingHorizontal: 0,
  },
  mobileSearchContainer: {
    width: '100%',
    marginBottom: 4,
  },
  mobileSearchInput: {
    width: '100%',
    maxWidth: 'none',
    fontSize: 16,
    paddingVertical: 12,
    height: 48,
  },
  mobilePaginationButton: {
    minWidth: 80,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
}); 