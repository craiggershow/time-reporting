import { UserManagement } from '@/components/admin/UserManagement';
import { MobileUserManagement } from '@/components/admin/MobileUserManagement';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, useWindowDimensions } from 'react-native';
import { MobileAdminNav } from '@/components/admin/MobileAdminNav';

export default function UsersPage() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {isMobile ? (
        <>
          <MobileUserManagement />
          <MobileAdminNav />
        </>
      ) : (
        <UserManagement />
      )}
    </SafeAreaView>
  );
} 