import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '../ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export function Header() {
  const { colors } = useTheme();

  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { 
      borderBottomColor: colors.border,
      backgroundColor: colors.inputBackground,
    }]}>
      <View style={styles.content}>
        <View>
          <ThemedText style={styles.title}>KV Dental</ThemedText>
          <ThemedText style={styles.email}>admin@kvdental.ca</ThemedText>
        </View>
        <TouchableOpacity 
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: colors.tint }]}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  email: {
    fontSize: 12,
    marginTop: 2,
    color: '#ffffff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
}); 