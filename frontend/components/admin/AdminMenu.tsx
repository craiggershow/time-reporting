import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  description: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'timesheet',
    title: 'My Timesheet',
    icon: 'calendar-outline',
    route: '/timesheet',
    description: 'View and edit your timesheet'
  },
  {
    id: 'timesheets',
    title: 'Timesheet Management',
    icon: 'time-outline',
    route: '/admin/timesheets',
    description: 'Review and approve employee timesheets'
  },
  {
    id: 'users',
    title: 'User Management',
    icon: 'people-outline',
    route: '/(app)/admin/users',
    description: 'Manage employee accounts and permissions'
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: 'bar-chart-outline',
    route: '/(app)/admin/reports',
    description: 'Generate and view timesheet reports'
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'settings-outline',
    route: '/(app)/admin/settings',
    description: 'Configure system settings and preferences'
  }
];

export function AdminMenu() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {MENU_ITEMS.map((item) => (
        <Pressable
          key={item.id}
          style={styles.menuItem}
          onPress={() => router.push(item.route)}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={24} color="#64748b" />
          </View>
          <View style={styles.textContainer}>
            <ThemedText style={styles.title}>{item.title}</ThemedText>
            <ThemedText style={styles.description}>{item.description}</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  description: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
}); 