import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ReportFilters, ReportFilters as ReportFiltersType } from './ReportFilters';
import { ReportResults } from './ReportResults';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { colors, spacing } from '@/styles/common';
import { buildApiUrl } from '@/constants/Config';

export function ReportingTool() {
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
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">Time Reporting Tool</ThemedText>
          <ThemedText style={styles.subtitle}>
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
          <View style={styles.emptyState}>
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
  header: {
    marginBottom: spacing.lg,
  },
  subtitle: {
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateText: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
}); 