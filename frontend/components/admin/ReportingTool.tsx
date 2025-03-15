import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ReportFilters, ReportFilters as ReportFiltersType } from './ReportFilters';
import { ReportResults } from './ReportResults';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { colors, spacing } from '@/styles/common';
import { buildApiUrl } from '@/constants/Config';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Column definitions for the DataTable
const summaryColumns = [
  { key: 'employeeName', title: 'Employee', width: 200 },
  { key: 'regularHours', title: 'Regular Hours', width: 120 },
  { key: 'overtimeHours', title: 'Overtime Hours', width: 120 },
  { key: 'totalHours', title: 'Total Hours', width: 120 },
];

const detailedColumns = [
  { key: 'date', title: 'Date', width: 120 },
  { key: 'employeeName', title: 'Employee', width: 200 },
  { key: 'totalHours', title: 'Hours', width: 80 },
  { key: 'dayType', title: 'Type', width: 100 },
];

// Mock data for fallback
const summaryData = [
  { id: '1', employeeName: 'John Doe', regularHours: 40, overtimeHours: 0, totalHours: 40 },
  { id: '2', employeeName: 'Jane Smith', regularHours: 40, overtimeHours: 5, totalHours: 45 },
];

const detailedData = [
  { id: '1', date: '2023-06-01', employeeName: 'John Doe', totalHours: 8, dayType: 'Regular' },
  { id: '2', date: '2023-06-02', employeeName: 'John Doe', totalHours: 8, dayType: 'Regular' },
  { id: '3', date: '2023-06-01', employeeName: 'Jane Smith', totalHours: 9, dayType: 'Overtime' },
  { id: '4', date: '2023-06-02', employeeName: 'Jane Smith', totalHours: 8, dayType: 'Regular' },
];

export function ReportingTool() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  
  const [filters, setFilters] = useState<ReportFiltersType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);

  const handleApplyFilters = async (filters: ReportFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Applying filters:', filters);
      
      // Format the date parameters
      const startDateStr = filters.startDate.toISOString().split('T')[0];
      const endDateStr = filters.endDate.toISOString().split('T')[0];
      
      // Prepare the request body
      const requestBody = {
        startDate: startDateStr,
        endDate: endDateStr,
        employeeIds: filters.employeeIds.length > 0 ? filters.employeeIds : undefined,
        reportType: filters.reportType,
        includeInactive: filters.includeInactive,
        payPeriodId: filters.dateRangeType === 'payPeriod' ? filters.payPeriodId : undefined,
        dateRangeType: filters.dateRangeType,
      };
      
      console.log('Generating report with parameters:', requestBody);
      
      // Make the API call to generate the report
      const response = await fetch(buildApiUrl('REPORTS'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate report: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store the report data
      setReportData(data.items || []);
      setHasGeneratedReport(true);
    } catch (error) {
      console.error('Error generating report:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate report');
      
      // Fallback to mock data if API fails
      if (filters.reportType === 'summary') {
        setReportData(summaryData);
      } else {
        setReportData(detailedData);
      }
      setHasGeneratedReport(true);
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

  const handleExportCSV = async () => {
    if (!reportData || reportData.length === 0 || !filters) {
      console.log('No data to export or filters not set');
      return;
    }

    try {
      // Determine which columns to use based on report type
      const columns = filters.reportType === 'summary' ? summaryColumns : detailedColumns;
      
      // Create CSV header row
      const header = columns.map(col => col.title).join(',');
      
      // Create CSV data rows
      const rows = reportData.map(item => {
        return columns.map(col => {
          // Get the value for this column
          const value = item[col.key];
          
          // Handle special cases like strings with commas
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          
          return value;
        }).join(',');
      });
      
      // Combine header and rows
      const csvContent = [header, ...rows].join('\n');
      
      // Generate filename based on report type and date
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportType = filters.reportType === 'summary' ? 'Summary' : 'Detailed';
      const filename = `TimeReport_${reportType}_${timestamp}.csv`;
      
      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For mobile, save to file and share
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8
        });
        
        // Check if sharing is available
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Export Report',
            UTI: 'public.comma-separated-values-text'
          });
        } else {
          console.log('Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const renderEmptyState = () => (
    <View style={[styles.emptyState, isWeb && styles.webEmptyState]}>
      <ThemedText style={styles.emptyStateText}>
        Select filters and click "Apply Filters" to generate a report
      </ThemedText>
    </View>
  );

  const renderReportHeader = () => {
    if (!filters) return null;
    
    const startDate = filters.startDate.toLocaleDateString();
    const endDate = filters.endDate.toLocaleDateString();
    const reportType = filters.reportType === 'summary' ? 'Summary' : 'Detailed';
    
    return (
      <View style={[styles.reportHeader, isWeb && styles.webReportHeader]}>
        <ThemedText type="subtitle">Report Results</ThemedText>
        <ThemedText style={styles.reportDetails}>
          {reportType} report for {startDate} to {endDate}
        </ThemedText>
      </View>
    );
  };

  const renderReportResults = () => {
    if (!hasGeneratedReport && !isLoading) {
      return renderEmptyState();
    }

    return (
      <View style={styles.reportContainer}>
        {renderReportHeader()}

        {isLoading ? (
          <LoadingSpinner message="Generating report..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <>
            <ScrollView horizontal style={styles.tableContainer}>
              {filters && filters.reportType === 'summary' ? (
                <DataTable
                  columns={summaryColumns}
                  data={reportData}
                  isLoading={false}
                  selectedIds={[]}
                />
              ) : (
                <DataTable
                  columns={detailedColumns}
                  data={reportData}
                  isLoading={false}
                  selectedIds={[]}
                />
              )}
            </ScrollView>

            <View style={styles.exportContainer}>
              <Button
                variant="secondary"
                leftIcon={<Ionicons name="download-outline" size={20} color={colors.primary} />}
                onPress={handleExportCSV}
              >
                Export Report
              </Button>
            </View>
          </>
        )}
      </View>
    );
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

        {renderReportResults()}
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
  reportContainer: {
    flex: 1,
  },
  tableContainer: {
    flex: 1,
  },
  exportContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  reportHeader: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  webReportHeader: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
  },
  reportDetails: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: 4,
  },
}); 