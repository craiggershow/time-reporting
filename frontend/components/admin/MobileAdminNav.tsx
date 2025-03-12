import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

interface NavItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'grid-outline',
    route: '/(app)/admin',
  },
  {
    label: 'Users',
    icon: 'people-outline',
    route: '/(app)/admin/users',
  },
  {
    label: 'Timesheets',
    icon: 'time-outline',
    route: '/(app)/admin/timesheets',
  },
  {
    label: 'Reports',
    icon: 'bar-chart-outline',
    route: '/(app)/admin/reports',
  },
];

export function MobileAdminNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = pathname === item.route;
        return (
          <TouchableOpacity
            key={item.route}
            style={styles.tabButton}
            onPress={() => router.push(item.route)}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={isActive ? '#2563eb' : '#64748b'}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? '#2563eb' : '#64748b' },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    height: 60,
    paddingBottom: 5,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
  },
}); 