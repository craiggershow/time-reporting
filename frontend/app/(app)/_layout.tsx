import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { colors } from '@/styles/common';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function AppLayout() {
  return <Slot />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.page,
  },
}); 