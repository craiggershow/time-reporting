import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/styles/common';

export default function AdminDashboard() {
  return (
    <View style={commonStyles.pageContainer}>
      <ThemedText>Admin Dashboard</ThemedText>
    </View>
  );
} 