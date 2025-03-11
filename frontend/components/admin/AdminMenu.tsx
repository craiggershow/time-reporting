import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/styles/common';

// Define hardcoded colors to avoid ThemeContext dependency
const menuColors = {
  text: {
    secondary: '#4b5563',
  },
  background: {
    card: '#ffffff',
    tableAlt: '#f8fafc',
  }
};

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
    <View style={styles.menuContainer}>
      {menuItems.map((item, index) => (
        <Link 
          key={item.route} 
          href={item.route} 
          asChild
        >
          <Pressable 
            style={{
              ...styles.menuItem,
              ...(index < menuItems.length - 1 ? styles.menuItemWithMargin : {})
            }}
          >
            <Ionicons 
              name={item.icon} 
              size={24} 
              color={menuColors.text.secondary} 
              style={styles.icon} 
            />
            <View style={styles.textContainer}>
              <ThemedText type="subtitle">{item.title}</ThemedText>
              <ThemedText style={styles.description}>
                {item.description}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={menuColors.text.secondary} />
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: menuColors.background.card,
    borderRadius: 8,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      }
    })
  },
  menuItemWithMargin: {
    marginBottom: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.md,
  },
  description: {
    color: menuColors.text.secondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  icon: {
    padding: spacing.sm,
    backgroundColor: menuColors.background.tableAlt,
    borderRadius: 20,
  },
}); 