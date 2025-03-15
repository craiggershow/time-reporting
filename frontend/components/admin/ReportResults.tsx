import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { colors, spacing } from '@/styles/common';
import { Ionicons } from '@expo/vector-icons';
import { ReportFilters } from './ReportFilters';

interface ReportResultsProps {
  filters: ReportFilters;
  isLoading: boolean;
  data: any[]; // This would be properly typed in a real app
}

export function ReportResults({ filters, isLoading, data }: ReportResultsProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleExportCSV = () => {
    // In a real app, this would generate and download a CSV file
    console.log('Exporting CSV with filters:', filters);
  };

  const handleExportPDF = () => {
    // In a real app, this would generate and download a PDF file
    console.log('Exporting PDF with filters:', filters);
  };

  const handlePrint = () => {
    // In a real app, this would open a print dialog
    console.log('Printing report with filters:', filters);
  };

  // Summary columns for the data table
  const summaryColumns = [
    { 
      key: 'employeeName', 
      title: 'Employee',
      sortable: true,
      width: 200,
    },
    { 
      key: 'regularHours', 
      title: 'Regular Hours',
      sortable: true,
      width: 120,
    },
    { 
      key: 'overtimeHours', 
      title: 'Overtime',
      sortable: true,
      width: 120,
    },
    { 
      key: 'vacationHours', 
      title: 'Vacation',
      sortable: true,
      width: 120,
    },
    { 
      key: 'sickHours', 
      title: 'Sick',
      sortable: true,
      width: 120,
    },
    { 
      key: 'holidayHours', 
      title: 'Holiday',
      sortable: true,
      width: 120,
    },
    { 
      key: 'totalHours', 
      title: 'Total Hours',
      sortable: true,
      width: 120,
    },
  ];

  // Detailed columns for the data table
  const detailedColumns = [
    { 
      key: 'date', 
      title: 'Date',
      sortable: true,
      width: 120,
    },
    { 
      key: 'employeeName', 
      title: 'Employee',
      sortable: true,
      width: 200,
    },
    { 
      key: 'startTime', 
      title: 'Start Time',
      sortable: true,
      width: 120,
    },
    { 
      key: 'endTime', 
      title: 'End Time',
      sortable: true,
      width: 120,
    },
    { 
      key: 'lunchStart', 
      title: 'Lunch Start',
      sortable: true,
      width: 120,
    },
    { 
      key: 'lunchEnd', 
      title: 'Lunch End',
      sortable: true,
      width: 120,
    },
    { 
      key: 'dayType', 
      title: 'Day Type',
      sortable: true,
      width: 120,
    },
    { 
      key: 'totalHours', 
      title: 'Total Hours',
      sortable: true,
      width: 120,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText type="subtitle">Report Results</ThemedText>
          <ThemedText style={styles.dateRange}>
            {formatDate(filters.startDate)} - {formatDate(filters.endDate)}
          </ThemedText>
        </View>
        <View style={styles.actions}>
          <Button
            variant="secondary"
            size="small"
            leftIcon="download-outline"
            label="CSV"
            onPress={handleExportCSV}
            style={styles.actionButton}
          />
          <Button
            variant="secondary"
            size="small"
            leftIcon="document-outline"
            label="PDF"
            onPress={handleExportPDF}
            style={styles.actionButton}
          />
          <Button
            variant="secondary"
            size="small"
            leftIcon="print-outline"
            label="Print"
            onPress={handlePrint}
            style={styles.actionButton}
          />
        </View>
      </View>

      <ScrollView horizontal style={styles.tableContainer}>
        <DataTable
          columns={filters.reportType === 'summary' ? summaryColumns : detailedColumns}
          data={data}
          isLoading={isLoading}
          onRowSelect={() => {}}
          selectedIds={[]}
        />
      </ScrollView>

      {filters.reportType === 'summary' && (
        <View style={styles.totals}>
          <ThemedText style={styles.totalsLabel}>Total Hours:</ThemedText>
          <ThemedText style={styles.totalsValue}>
            {data.reduce((sum, item) => sum + item.totalHours, 0)}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateRange: {
    color: colors.text.secondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: spacing.sm,
  },
  tableContainer: {
    marginTop: spacing.md,
    flex: 1,
  },
  totals: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalsLabel: {
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  totalsValue: {
    fontWeight: '600',
    fontSize: 18,
    color: colors.primary,
  },
}); 