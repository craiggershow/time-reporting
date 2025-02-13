import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const menuItems: MenuItem[] = [
  {
    title: 'User Management',
    description: 'Add, edit, and manage user accounts',
    icon: 'people-outline',
    route: '/(app)/admin/users',
  },
  {
    title: 'Timesheet Approval',
    description: 'Review and approve submitted timesheets',
    icon: 'time-outline',
    route: '/(app)/admin/timesheets',
  },
  {
    title: 'Reports',
    description: 'View and export timesheet reports',
    icon: 'bar-chart-outline',
    route: '/(app)/admin/reports',
  },
  {
    title: 'Settings',
    description: 'Configure system settings',
    icon: 'settings-outline',
    route: '/(app)/admin/settings',
  },
];

export function AdminMenu() {
  return (
    <View style={styles.container}>
      {menuItems.map((item) => (
        <Link 
          key={item.route} 
          href={item.route} 
          asChild
        >
          <Pressable style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon} size={24} color="#64748b" />
            </View>
            <View style={styles.textContainer}>
              <ThemedText type="subtitle">{item.title}</ThemedText>
              <ThemedText style={styles.description}>{item.description}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748b" />
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  description: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
  },
}); 