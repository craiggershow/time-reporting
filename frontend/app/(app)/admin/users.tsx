import { View } from 'react-native';
import { UserManagement } from '@/components/admin/UserManagement';

export default function UsersScreen() {
  return (
    <View style={{ flex: 1 }}>
      <UserManagement />
    </View>
  );
} 