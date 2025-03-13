import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SafeDateTimePicker } from '@/components/ui/SafeDateTimePicker';
import { Checkbox } from '@/components/ui/Checkbox';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { colors, spacing } from '@/styles/common';
import { Ionicons } from '@expo/vector-icons';
import { DateRangeType } from './ReportFilters';
import { DataTable } from '@/components/ui/DataTable';
import { buildApiUrl } from '@/constants/Config';
import { MobileReportFilterSheet } from './MobileReportFilterSheet';

interface PayPeriod {
  id: string;
  startDate: string;
  endDate: string;
  name: string;
}

// Define interfaces for report data types
interface SummaryReportItem {
  id: string;
  employeeName: string;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
}

interface DetailedReportItem {
  id: string;
  date: string;
  employeeName: string;
  totalHours: number;
}

// Define Column interface locally to match DataTable's expected type
interface Column<T> {
  key: keyof T | 'actions' | 'select';
  title: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: number;
  hideOnMobile?: boolean;
}

export function MobileReportingTool() {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reportType, setReportType] = useState<'summary' | 'detailed'>('summary');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('payPeriod');
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [selectedPayPeriodId, setSelectedPayPeriodId] = useState<string>('');
  const [isLoadingPayPeriods, setIsLoadingPayPeriods] = useState(false);
  const [payPeriodsError, setPayPeriodsError] = useState<string | null>(null);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Mock data for employees - in a real app, this would come from an API
  const employees = [
    { id: '1', name: 'John Doe', email: 'john@example.com', isActive: true },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', isActive: true },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', isActive: false },
  ];

  useEffect(() => {
    // Set selected employees to all active employees
    const activeEmployeeIds = employees
      .filter(employee => employee.isActive)
      .map(employee => employee.id);
    
    setSelectedEmployees(activeEmployeeIds);
  }, []);

  useEffect(() => {
    fetchPayPeriods();
  }, []);

  useEffect(() => {
    // Update date range based on selected type
    updateDateRange(dateRangeType);
  }, [dateRangeType, selectedPayPeriodId]);

  useEffect(() => {
    // Calculate the number of active filters
    let count = 0;
    
    // Date range filter
    if (dateRangeType !== 'custom') {
      count++;
    }
    
    // Employee filter - only count if not all active employees are selected
    const activeEmployeeIds = employees
      .filter(employee => employee.isActive)
      .map(employee => employee.id);
    
    if (selectedEmployees.length !== activeEmployeeIds.length || 
        !selectedEmployees.every(id => activeEmployeeIds.includes(id))) {
      count++;
    }
    
    // Include inactive filter
    if (includeInactive) {
      count++;
    }
    
    // Report type filter (only count if not the default)
    if (reportType !== 'summary') {
      count++;
    }
    
    setActiveFiltersCount(count);
  }, [dateRangeType, selectedEmployees, includeInactive, reportType, employees]);

  const fetchPayPeriods = async () => {
    try {
      setIsLoadingPayPeriods(true);
      setPayPeriodsError(null);
      
      // Fetch pay periods from the API
      const response = await fetch(buildApiUrl('PAY_PERIODS'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pay periods');
      }

      const data = await response.json();
      
      // Transform the data to match our PayPeriod interface
      const formattedPayPeriods = data.map((period: any) => {
        // Create date objects that ignore time/timezone by using YYYY-MM-DD format
        const startDateStr = period.startDate.split('T')[0];
        const endDateStr = period.endDate.split('T')[0];
        
        // Create date objects with time set to noon to avoid timezone issues
        const startDate = new Date(`${startDateStr}T12:00:00`);
        const endDate = new Date(`${endDateStr}T12:00:00`);
        
        return {
          id: period.id,
          startDate: startDateStr,
          endDate: endDateStr,
          name: formatPayPeriodName(startDate, endDate),
        };
      });
      
      // Sort by startDate in descending order to get most recent first
      formattedPayPeriods.sort((a: PayPeriod, b: PayPeriod) => 
        new Date(`${b.startDate}T12:00:00`).getTime() - new Date(`${a.startDate}T12:00:00`).getTime()
      );
      
      // Limit to 10 most recent pay periods
      const recentPayPeriods = formattedPayPeriods.slice(0, 10);
      
      setPayPeriods(recentPayPeriods);
      
      // Set the previous pay period (second most recent) as default
      if (recentPayPeriods.length > 1) {
        setSelectedPayPeriodId(recentPayPeriods[1].id);
        
        // Update date range based on the selected pay period
        const selectedPeriod = recentPayPeriods[1];
        const start = new Date(`${selectedPeriod.startDate}T12:00:00`);
        const end = new Date(`${selectedPeriod.endDate}T12:00:00`);
        setStartDate(start);
        setEndDate(end);
      } else if (recentPayPeriods.length === 1) {
        // If only one pay period exists, use that one
        setSelectedPayPeriodId(recentPayPeriods[0].id);
        
        // Update date range based on the selected pay period
        const selectedPeriod = recentPayPeriods[0];
        const start = new Date(`${selectedPeriod.startDate}T12:00:00`);
        const end = new Date(`${selectedPeriod.endDate}T12:00:00`);
        setStartDate(start);
        setEndDate(end);
      }
    } catch (error) {
      console.error('Failed to fetch pay periods:', error);
      setPayPeriodsError('Failed to load pay periods. Please try again.');
      
      // Fallback to mock data if API fails
      const mockPayPeriods = generateMockPayPeriods();
      setPayPeriods(mockPayPeriods);
      
      // Set the previous pay period (second most recent) as default
      if (mockPayPeriods.length > 1) {
        setSelectedPayPeriodId(mockPayPeriods[1].id);
        
        // Update date range based on the selected pay period
        const selectedPeriod = mockPayPeriods[1];
        const start = new Date(`${selectedPeriod.startDate}T12:00:00`);
        const end = new Date(`${selectedPeriod.endDate}T12:00:00`);
        setStartDate(start);
        setEndDate(end);
      } else if (mockPayPeriods.length === 1) {
        setSelectedPayPeriodId(mockPayPeriods[0].id);
        
        // Update date range based on the selected pay period
        const selectedPeriod = mockPayPeriods[0];
        const start = new Date(`${selectedPeriod.startDate}T12:00:00`);
        const end = new Date(`${selectedPeriod.endDate}T12:00:00`);
        setStartDate(start);
        setEndDate(end);
      }
    } finally {
      setIsLoadingPayPeriods(false);
    }
  };

  // Generate mock pay periods for development/fallback
  const generateMockPayPeriods = (): PayPeriod[] => {
    const today = new Date();
    const payPeriods: PayPeriod[] = [];
    
    // Generate 10 pay periods, each 14 days long, starting from the most recent one
    let endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (14 - today.getDay()));
    
    for (let i = 0; i < 10; i++) {
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 13); // 14-day period
      
      // Format dates as YYYY-MM-DD strings to avoid timezone issues
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      payPeriods.push({
        id: (i + 1).toString(),
        startDate: startDateStr,
        endDate: endDateStr,
        name: formatPayPeriodName(startDate, endDate),
      });
      
      // Move to the previous period
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() - 1);
    }
    
    return payPeriods;
  };

  // Format pay period name (e.g., "May 1-14, 2023")
  const formatPayPeriodName = (startDate: Date, endDate: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    const startFormatted = startDate.toLocaleDateString('en-US', options);
    const endFormatted = endDate.toLocaleDateString('en-US', options);
    
    // Always use the full date format for consistency
    return `${startFormatted} - ${endFormatted}`;
  };

  const updateDateRange = (type: DateRangeType) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (type) {
      case 'payPeriod':
        if (selectedPayPeriodId) {
          const selectedPeriod = payPeriods.find(p => p.id === selectedPayPeriodId);
          if (selectedPeriod) {
            // Create date objects with time set to noon to avoid timezone issues
            start = new Date(`${selectedPeriod.startDate}T12:00:00`);
            end = new Date(`${selectedPeriod.endDate}T12:00:00`);
          }
        }
        break;
      case 'currentMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 12, 0, 0);
        break;
      case 'previousMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1, 12, 0, 0);
        end = new Date(today.getFullYear(), today.getMonth(), 0, 12, 0, 0);
        break;
      case 'ytd':
        start = new Date(today.getFullYear(), 0, 1, 12, 0, 0);
        end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
        break;
      case 'custom':
        // Keep current custom dates
        return;
    }

    setStartDate(start);
    setEndDate(end);
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId) 
        : [...prev, employeeId]
    );
  };

  const handleSelectAllEmployees = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, this would be an API call to fetch report data
      // For now, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasGeneratedReport(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    // Reset to previous pay period instead of custom date range
    setDateRangeType('payPeriod');
    
    // If pay periods are available, select the previous pay period
    if (payPeriods.length > 1) {
      setSelectedPayPeriodId(payPeriods[1].id);
      
      // Update date range based on the selected pay period
      const selectedPeriod = payPeriods[1];
      const start = new Date(`${selectedPeriod.startDate}T12:00:00`);
      const end = new Date(`${selectedPeriod.endDate}T12:00:00`);
      setStartDate(start);
      setEndDate(end);
    } else if (payPeriods.length === 1) {
      setSelectedPayPeriodId(payPeriods[0].id);
      
      // Update date range based on the selected pay period
      const selectedPeriod = payPeriods[0];
      const start = new Date(`${selectedPeriod.startDate}T12:00:00`);
      const end = new Date(`${selectedPeriod.endDate}T12:00:00`);
      setStartDate(start);
      setEndDate(end);
    } else {
      // Fallback to current date range if no pay periods are available
      setStartDate(new Date());
      setEndDate(new Date());
    }
    
    setReportType('summary');
    
    // Reset to all active employees
    const activeEmployeeIds = employees
      .filter(employee => employee.isActive)
      .map(employee => employee.id);
    setSelectedEmployees(activeEmployeeIds);
    
    setIncludeInactive(false);
    setHasGeneratedReport(false);
    setError(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Summary columns for the data table
  const summaryColumns: Column<SummaryReportItem>[] = [
    { 
      key: 'employeeName', 
      title: 'Employee',
      sortable: true,
      width: 150,
    },
    { 
      key: 'regularHours', 
      title: 'Reg',
      sortable: true,
      width: 60,
    },
    { 
      key: 'overtimeHours', 
      title: 'OT',
      sortable: true,
      width: 60,
    },
    { 
      key: 'totalHours', 
      title: 'Total',
      sortable: true,
      width: 70,
    },
  ];

  // Detailed columns for the data table
  const detailedColumns: Column<DetailedReportItem>[] = [
    { 
      key: 'date', 
      title: 'Date',
      sortable: true,
      width: 100,
    },
    { 
      key: 'employeeName', 
      title: 'Employee',
      sortable: true,
      width: 150,
    },
    { 
      key: 'totalHours', 
      title: 'Hours',
      sortable: true,
      width: 70,
    },
  ];

  // Mock data for summary report
  const summaryData: SummaryReportItem[] = [
    {
      id: '1',
      employeeName: 'John Doe',
      regularHours: 70,
      overtimeHours: 5,
      totalHours: 91,
    },
    {
      id: '2',
      employeeName: 'Jane Smith',
      regularHours: 80,
      overtimeHours: 0,
      totalHours: 96,
    },
  ];

  // Mock data for detailed report
  const detailedData: DetailedReportItem[] = [
    {
      id: '1',
      date: '2023-05-01',
      employeeName: 'John Doe',
      totalHours: 7,
    },
    {
      id: '2',
      date: '2023-05-02',
      employeeName: 'John Doe',
      totalHours: 8,
    },
    {
      id: '3',
      date: '2023-05-01',
      employeeName: 'Jane Smith',
      totalHours: 7,
    },
  ];

  const renderReportHeader = () => {
    return (
      <View style={styles.reportHeader}>
        <View>
          <ThemedText type="subtitle">Report Results</ThemedText>
          <ThemedText style={styles.dateRange}>
            {formatDate(startDate)} - {formatDate(endDate)}
          </ThemedText>
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterSheet(true)}
        >
          <Ionicons name="options-outline" size={20} color={colors.primary} />
          <ThemedText style={styles.filterButtonText}>Filters</ThemedText>
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <ThemedText style={styles.filterBadgeText}>{activeFiltersCount}</ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <Ionicons name="analytics-outline" size={64} color={colors.text.secondary} />
        <ThemedText style={styles.emptyStateTitle}>No Report Generated</ThemedText>
        <ThemedText style={styles.emptyStateText}>
          Set your filters and generate a report to see results here.
        </ThemedText>
        <Button 
          label="Set Filters" 
          onPress={() => setShowFilterSheet(true)}
          style={styles.emptyStateButton}
          leftIcon="options-outline"
        />
      </View>
    );
  };

  const renderReportResults = () => {
    if (!hasGeneratedReport && !isLoading) {
      return renderEmptyState();
    }

    return (
      <>
        {renderReportHeader()}

        {isLoading ? (
          <LoadingSpinner message="Generating report..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <>
            <ScrollView horizontal style={styles.tableContainer}>
              {reportType === 'summary' ? (
                <DataTable
                  columns={summaryColumns}
                  data={summaryData}
                  isLoading={false}
                  selectedIds={[]}
                />
              ) : (
                <DataTable
                  columns={detailedColumns}
                  data={detailedData}
                  isLoading={false}
                  selectedIds={[]}
                />
              )}
            </ScrollView>

            <View style={styles.exportContainer}>
              <Button
                variant="secondary"
                size="small"
                leftIcon="download-outline"
                label="Export Report"
                onPress={() => console.log('Export')}
                style={styles.exportButton}
              />
            </View>
          </>
        )}
      </>
    );
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {renderReportResults()}
        </View>
      </ScrollView>

      <MobileReportFilterSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        onApplyFilters={handleGenerateReport}
        onResetFilters={handleResetFilters}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        reportType={reportType}
        setReportType={setReportType}
        selectedEmployees={selectedEmployees}
        setSelectedEmployees={setSelectedEmployees}
        includeInactive={includeInactive}
        setIncludeInactive={setIncludeInactive}
        dateRangeType={dateRangeType}
        setDateRangeType={setDateRangeType}
        payPeriods={payPeriods}
        selectedPayPeriodId={selectedPayPeriodId}
        setSelectedPayPeriodId={setSelectedPayPeriodId}
        isLoadingPayPeriods={isLoadingPayPeriods}
        payPeriodsError={payPeriodsError}
        fetchPayPeriods={fetchPayPeriods}
        employees={employees}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: spacing.md,
    flex: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateRange: {
    color: colors.text.secondary,
    marginTop: 4,
    fontSize: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    position: 'relative',
  },
  filterButtonText: {
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: spacing.md,
  },
  exportContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  exportButton: {
    width: '80%',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl * 2,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    textAlign: 'center',
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  emptyStateButton: {
    minWidth: 150,
  },
}); 