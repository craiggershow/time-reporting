import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/layout/Header';
import { ThemedText } from '@/components/ThemedText';
import { ReportingTool } from '@/components/admin/ReportingTool';
import { MobileReportingTool } from '@/components/admin/MobileReportingTool';
import { MobileAdminNav } from '@/components/admin/MobileAdminNav';

export default function Reports() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <SafeAreaView style={styles.container}>
      {isMobile ? (
        <>
          <View style={styles.mobileHeader}>
            <ThemedText type="title" style={styles.mobileHeaderTitle}>Reports</ThemedText>
          </View>
          <MobileReportingTool />
          <MobileAdminNav />
        </>
      ) : (
        <>
          <Header />
          <ReportingTool />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mobileHeader: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
}); 