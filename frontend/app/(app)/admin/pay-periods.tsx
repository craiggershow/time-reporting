import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/styles/common';

export default function AdminPayPeriods() {
  return (
    <View style={commonStyles.pageContainer}>
      <ThemedText>Pay Periods Management</ThemedText>
    </View>
  );
} 