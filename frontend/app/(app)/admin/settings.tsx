import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/styles/common';

export default function AdminSettings() {
  return (
    <View style={commonStyles.adminContainer}>
      <View style={commonStyles.adminSection}>
        <View style={commonStyles.contentCard}>
          <ThemedText type="title">Settings</ThemedText>
          <ThemedText style={commonStyles.adminSubtitle}>
            Configure system settings and preferences
          </ThemedText>
          
          {/* Add settings content here */}
          <View style={commonStyles.adminMenuSection}>
            <ThemedText>Settings content coming soon...</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
} 