import { View, StyleSheet, Pressable, Image, useWindowDimensions } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/common';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const adminLinks = [
    { label: 'Dashboard', href: '/(app)/admin' },
    { label: 'Employees', href: '/(app)/admin/employees' },
    { label: 'Pay Periods', href: '/(app)/admin/pay-periods' },
    { label: 'Reports', href: '/(app)/admin/reports' },
    { label: 'Settings', href: '/(app)/admin/settings' },
    { label: 'Timesheets', href: '/(app)/admin/timesheets' },
    { label: 'Users', href: '/(app)/admin/users' },
  ];

  const handleAdminNavigation = () => {
    router.replace('/(app)/admin');
  };

  const handleLogout = async () => {
    try {
      // Call the auth context logout function
      await logout();
      
      // After successful logout, redirect to login page
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        {/* Logo section - now smaller and on the left */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={isMobile ? styles.logoMobile : styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.rightContent}>
          {/* User greeting */}
          {user && (
            <View style={styles.userInfo}>
              <ThemedText style={styles.userInfoText}>
                Hello, {user.firstName} {user.lastName}
              </ThemedText>
            </View>
          )}
          
          {/* Admin and logout buttons */}
          <View style={styles.buttonsContainer}>
            {user?.isAdmin && (
              <Pressable 
                style={styles.adminButton}
                onPress={handleAdminNavigation}
              >
                <Ionicons name="settings-outline" size={18} color="#000000" />
                {!isMobile && <ThemedText style={styles.adminText}>Admin</ThemedText>}
              </Pressable>
            )}
            <Pressable 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={18} color="#000000" />
              {!isMobile && <ThemedText style={styles.logoutText}>Logout</ThemedText>}
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  logoContainer: {
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 40,
  },
  logoMobile: {
    width: 150,
    height: 30,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    marginRight: 8,
  },
  userInfoText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  adminText: {
    color: '#000000',
    fontWeight: '500',
    fontSize: 13,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  logoutText: {
    color: '#000000',
    fontSize: 13,
  },
}); 