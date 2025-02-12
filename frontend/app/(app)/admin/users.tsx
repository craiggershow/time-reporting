import { View, StyleSheet } from 'react-native';
import { Header } from '@/components/layout/Header';
import { UserManagement } from '@/components/admin/UserManagement';

export default function UserManagementScreen() {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <View style={styles.contentCard}>
          <UserManagement />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 