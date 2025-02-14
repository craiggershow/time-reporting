import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/styles/common';

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
    <View style={{ gap: spacing.md }}>
      {menuItems.map((item) => (
        <Link 
          key={item.route} 
          href={item.route} 
          asChild
        >
          <Pressable style={styles.menuItem}>
            <Ionicons 
              name={item.icon} 
              size={24} 
              color={colors.text.secondary} 
              style={styles.icon} 
            />
            <View style={{ flex: 1 }}>
              <ThemedText type="subtitle">{item.title}</ThemedText>
              <ThemedText style={{ color: colors.text.secondary, fontSize: 14, marginTop: spacing.xs }}>
                {item.description}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: 8,
    gap: spacing.md,
  },
  icon: {
    padding: spacing.sm,
    backgroundColor: colors.background.tableAlt,
    borderRadius: 20,
  },
}); 