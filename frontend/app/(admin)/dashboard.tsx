import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const router = useRouter();
  const { colors } = useTheme();

  const menuItems = [
    {
      title: 'Pay Periods',
      icon: 'calendar-outline',
      onPress: () => router.push('/(admin)/pay-periods'),
    },
    {
      title: 'Employees',
      icon: 'people-outline',
      onPress: () => router.push('/(admin)/employees'),
    },
    {
      title: 'Reports',
      icon: 'bar-chart-outline',
      onPress: () => router.push('/(admin)/reports'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.grid}>
        {menuItems.map((item) => (
          <Pressable
            key={item.title}
            style={({ pressed }) => [
              styles.menuItem,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={item.onPress}
          >
            <Card style={styles.card}>
              <Ionicons 
                name={item.icon as any} 
                size={32} 
                color={colors.primary} 
              />
              <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  menuItem: {
    width: '47%',
    minWidth: 150,
    aspectRatio: 1,
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  menuTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },
}); 