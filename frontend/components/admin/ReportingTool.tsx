import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ReportFilters, ReportFilters as ReportFiltersType } from './ReportFilters';
import { ReportResults } from './ReportResults';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { colors, spacing } from '@/styles/common';
import { buildApiUrl } from '@/constants/Config';

export function ReportingTool() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  
  const [filters, setFilters] = useState<ReportFiltersType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);

  const handleApplyFilters = async (newFilters: ReportFiltersType) => {
    try {
      setIsLoading(true);
      setError(null);
      setFilters(newFilters);
      
      // In a real app, this would be an API call to fetch report data
      // For now, we'll simulate a delay and use mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in a real app, this would come from the API
      setReportData([]);
      setHasGeneratedReport(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters(null);
    setReportData([]);
    setHasGeneratedReport(false);
    setError(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.content, isWeb && styles.webContent]}>
        <View style={[styles.header, isWeb && styles.webHeader]}>
          <ThemedText type={isWeb ? "subtitle" : "title"}>Time Reporting Tool</ThemedText>
          <ThemedText style={[styles.subtitle, isWeb && styles.webSubtitle]}>
            Generate reports on employee time entries
          </ThemedText>
        </View>

        <ReportFilters 
          onApplyFilters={handleApplyFilters} 
          onResetFilters={handleResetFilters} 
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner message="Generating report..." />
          </View>
        )}

        {error && (
          <ErrorMessage message={error} />
        )}

        {hasGeneratedReport && filters && !isLoading && (
          <ReportResults 
            filters={filters} 
            isLoading={isLoading} 
            data={reportData} 
          />
        )}

        {!hasGeneratedReport && !isLoading && (
          <View style={[styles.emptyState, isWeb && styles.webEmptyState]}>
            <ThemedText style={styles.emptyStateText}>
              Select filters and click "Apply Filters" to generate a report
            </ThemedText>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: spacing.lg,
    flex: 1,
  },
  webContent: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  webHeader: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  webSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
  },
  webEmptyState: {
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  emptyStateText: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
}); 