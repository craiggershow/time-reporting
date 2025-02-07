import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <ThemedText>{user?.name}</ThemedText>
      </View>
      <View style={styles.rightSection}>
        {user?.isAdmin && (
          <Pressable 
            style={styles.adminButton}
            onPress={() => router.push('/admin')}
          >
            <Ionicons name="settings-outline" size={20} color="#64748b" />
            <ThemedText style={styles.adminText}>Admin Portal</ThemedText>
          </Pressable>
        )}
        <Pressable 
          style={styles.logoutButton}
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={20} color="#64748b" />
          <ThemedText>Logout</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#f1f5f9',
  },
  adminText: {
    color: '#64748b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
}); 