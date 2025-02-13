import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { colors } from '@/styles/common';
import { View, StyleSheet } from 'react-native';

export default function AppLayout() {
  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background.page },
          }}
        >
          <Stack.Screen
            name="index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="timesheet"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="admin"
            options={{ headerShown: false }}
          />
        </Stack>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.page,
  },
}); 