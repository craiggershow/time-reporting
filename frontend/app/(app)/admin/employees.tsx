import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/styles/common';

export default function AdminEmployees() {
  return (
    <View style={commonStyles.pageContainer}>
      <ThemedText>Employee Management</ThemedText>
    </View>
  );
} 