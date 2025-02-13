import { View, StyleSheet, Pressable, Image } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/common';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.leftSection}>
          <ThemedText style={styles.userName}>{user?.name}</ThemedText>
        </View>
        <View style={styles.rightSection}>
          {user?.isAdmin && (
            <Pressable 
              style={styles.adminButton}
              onPress={() => router.push('/admin')}
            >
              <Ionicons name="settings-outline" size={20} color="#000000" />
              <ThemedText style={styles.adminText}>Admin Portal</ThemedText>
            </Pressable>
          )}
          <Pressable 
            style={styles.logoutButton}
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={20} color="#000000" />
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </Pressable>
        </View>
      </View>
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>
      {user && (
        <View style={styles.userInfo}>
          <ThemedText style={styles.userInfoText}>
            {user.firstName} {user.lastName} ({user.employeeId})
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  logoSection: {
    paddingTop: 0,
    paddingBottom: 0,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 400,
    height: 69,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  adminText: {
    color: '#000000',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  logoutText: {
    color: '#000000',
  },
  userInfo: {
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  userInfoText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  userName: {
    color: '#000000',
    fontWeight: '500',
  },
}); 