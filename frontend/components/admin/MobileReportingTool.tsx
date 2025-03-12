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

interface PayPeriod {
  id: string;
  startDate: string;
  endDate: string;
  name: string;
}

export function MobileReportingTool() {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reportType, setReportType] = useState<'summary' | 'detailed'>('summary');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('custom');
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [selectedPayPeriodId, setSelectedPayPeriodId] = useState<string>('');
  const [isLoadingPayPeriods, setIsLoadingPayPeriods] = useState(false);
  const [payPeriodsError, setPayPeriodsError] = useState<string | null>(null);

  // Mock data for employees - in a real app, this would come from an API
  const employees = [
    { id: '1', name: 'John Doe', email: 'john@example.com', isActive: true },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', isActive: true },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', isActive: false },
  ];

  useEffect(() => {
    fetchPayPeriods();
  }, []);

  useEffect(() => {
    // Update date range based on selected type
    updateDateRange(dateRangeType);
  }, [dateRangeType, selectedPayPeriodId]);

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
      formattedPayPeriods.sort((a, b) => 
        new Date(`${b.startDate}T12:00:00`).getTime() - new Date(`${a.startDate}T12:00:00`).getTime()
      );
      
      // Limit to 10 most recent pay periods
      const recentPayPeriods = formattedPayPeriods.slice(0, 10);
      
      setPayPeriods(recentPayPeriods);
      
      // Set the most recent pay period as default
      if (recentPayPeriods.length > 0) {
        setSelectedPayPeriodId(recentPayPeriods[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch pay periods:', error);
      setPayPeriodsError('Failed to load pay periods. Please try again.');
      
      // Fallback to mock data if API fails
      const mockPayPeriods = generateMockPayPeriods();
      setPayPeriods(mockPayPeriods);
      if (mockPayPeriods.length > 0) {
        setSelectedPayPeriodId(mockPayPeriods[0].id);
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

  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

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
      setShowFilters(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setStartDate(new Date());
    setEndDate(new Date());
    setReportType('summary');
    setSelectedEmployees([]);
    setIncludeInactive(false);
    setHasGeneratedReport(false);
    setDateRangeType('custom');
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
  const summaryColumns = [
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
  const detailedColumns = [
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
  const summaryData = [
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
  const detailedData = [
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

  const renderDateRangeSelector = () => {
    return (
      <View style={styles.dateRangeSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.dateRangeOption, dateRangeType === 'payPeriod' && styles.dateRangeOptionActive]}
            onPress={() => setDateRangeType('payPeriod')}
          >
            <ThemedText style={[styles.dateRangeText, dateRangeType === 'payPeriod' && styles.dateRangeTextActive]}>
              Pay Period
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.dateRangeOption, dateRangeType === 'currentMonth' && styles.dateRangeOptionActive]}
            onPress={() => setDateRangeType('currentMonth')}
          >
            <ThemedText style={[styles.dateRangeText, dateRangeType === 'currentMonth' && styles.dateRangeTextActive]}>
              Current Month
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.dateRangeOption, dateRangeType === 'previousMonth' && styles.dateRangeOptionActive]}
            onPress={() => setDateRangeType('previousMonth')}
          >
            <ThemedText style={[styles.dateRangeText, dateRangeType === 'previousMonth' && styles.dateRangeTextActive]}>
              Previous Month
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.dateRangeOption, dateRangeType === 'ytd' && styles.dateRangeOptionActive]}
            onPress={() => setDateRangeType('ytd')}
          >
            <ThemedText style={[styles.dateRangeText, dateRangeType === 'ytd' && styles.dateRangeTextActive]}>
              Year to Date
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.dateRangeOption, dateRangeType === 'custom' && styles.dateRangeOptionActive]}
            onPress={() => setDateRangeType('custom')}
          >
            <ThemedText style={[styles.dateRangeText, dateRangeType === 'custom' && styles.dateRangeTextActive]}>
              Custom
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderPayPeriodSelector = () => {
    if (dateRangeType !== 'payPeriod') return null;

    return (
      <View style={styles.payPeriodSelector}>
        <ThemedText style={styles.sectionSubtitle}>Select Pay Period:</ThemedText>
        
        {isLoadingPayPeriods ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="small" />
            <ThemedText style={styles.loadingText}>Loading pay periods...</ThemedText>
          </View>
        ) : payPeriodsError ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{payPeriodsError}</ThemedText>
            <TouchableOpacity onPress={fetchPayPeriods} style={styles.retryButton}>
              <ThemedText style={styles.retryText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : payPeriods.length === 0 ? (
          <ThemedText style={styles.noDataText}>No pay periods available</ThemedText>
        ) : (
          <View style={styles.payPeriodList}>
            {payPeriods.map(period => (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.payPeriodOption,
                  selectedPayPeriodId === period.id && styles.payPeriodOptionActive
                ]}
                onPress={() => setSelectedPayPeriodId(period.id)}
              >
                <ThemedText style={[
                  styles.payPeriodText,
                  selectedPayPeriodId === period.id && styles.payPeriodTextActive
                ]}>
                  {period.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderCustomDateRange = () => {
    if (dateRangeType !== 'custom') return null;

    return (
      <>
        <View style={styles.dateField}>
          <SafeDateTimePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
            mode="date"
          />
        </View>
        <View style={styles.dateField}>
          <SafeDateTimePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
            mode="date"
          />
        </View>
      </>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {showFilters ? (
          <>
            <View style={styles.filterSection}>
              <ThemedText style={styles.sectionTitle}>Date Range</ThemedText>
              {renderDateRangeSelector()}
              {renderPayPeriodSelector()}
              {renderCustomDateRange()}
              
              <View style={styles.selectedDateRange}>
                <ThemedText style={styles.selectedDateRangeLabel}>Selected Range:</ThemedText>
                <ThemedText style={styles.selectedDateRangeText}>
                  {formatDate(startDate)} - {formatDate(endDate)}
                </ThemedText>
              </View>
            </View>

            <View style={styles.filterSection}>
              <ThemedText style={styles.sectionTitle}>Report Type</ThemedText>
              <View style={styles.reportTypeContainer}>
                <TouchableOpacity 
                  style={[
                    styles.reportTypeButton, 
                    reportType === 'summary' && styles.reportTypeButtonActive
                  ]}
                  onPress={() => setReportType('summary')}
                >
                  <ThemedText 
                    style={[
                      styles.reportTypeText, 
                      reportType === 'summary' && styles.reportTypeTextActive
                    ]}
                  >
                    Summary
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.reportTypeButton, 
                    reportType === 'detailed' && styles.reportTypeButtonActive
                  ]}
                  onPress={() => setReportType('detailed')}
                >
                  <ThemedText 
                    style={[
                      styles.reportTypeText, 
                      reportType === 'detailed' && styles.reportTypeTextActive
                    ]}
                  >
                    Detailed
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterSection}>
              <ThemedText style={styles.sectionTitle}>Employees</ThemedText>
              <Checkbox
                label="Include Inactive Employees"
                value={includeInactive}
                onValueChange={setIncludeInactive}
              />
              <Checkbox
                label="Select All Employees"
                value={selectedEmployees.length === employees.length && employees.length > 0}
                onValueChange={handleSelectAllEmployees}
              />
              
              {employees
                .filter(employee => includeInactive || employee.isActive)
                .map(employee => (
                  <View key={employee.id} style={styles.employeeItem}>
                    <Checkbox
                      label={employee.name}
                      value={selectedEmployees.includes(employee.id)}
                      onValueChange={() => handleEmployeeToggle(employee.id)}
                    />
                    {!employee.isActive && (
                      <ThemedText style={styles.inactiveLabel}>(Inactive)</ThemedText>
                    )}
                  </View>
                ))
              }
            </View>

            <View style={styles.buttonContainer}>
              <Button 
                label="Generate Report" 
                onPress={handleGenerateReport} 
                style={styles.generateButton}
              />
              <Button 
                label="Reset" 
                variant="secondary"
                onPress={handleResetFilters} 
                style={styles.resetButton}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.reportHeader}>
              <View>
                <ThemedText type="subtitle">Report Results</ThemedText>
                <ThemedText style={styles.dateRange}>
                  {formatDate(startDate)} - {formatDate(endDate)}
                </ThemedText>
              </View>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setShowFilters(true)}
              >
                <Ionicons name="options-outline" size={20} color={colors.primary} />
                <ThemedText style={styles.filterButtonText}>Filters</ThemedText>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <LoadingSpinner message="Generating report..." />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : (
              <>
                <ScrollView horizontal style={styles.tableContainer}>
                  <DataTable
                    columns={reportType === 'summary' ? summaryColumns : detailedColumns}
                    data={reportType === 'summary' ? summaryData : detailedData}
                    isLoading={false}
                    onRowSelect={() => {}}
                    selectedIds={[]}
                  />
                </ScrollView>

                <View style={styles.exportContainer}>
                  <Button
                    variant="secondary"
                    size="small"
                    leftIcon="download-outline"
                    label="Export"
                    onPress={() => console.log('Export')}
                    style={styles.exportButton}
                  />
                </View>
              </>
            )}
          </>
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
    padding: spacing.md,
    flex: 1,
  },
  filterSection: {
    marginBottom: spacing.lg,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: spacing.sm,
    fontSize: 16,
  },
  sectionSubtitle: {
    marginBottom: spacing.sm,
    fontSize: 14,
  },
  dateRangeSelector: {
    marginBottom: spacing.md,
  },
  dateRangeOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 4,
    marginRight: spacing.sm,
    backgroundColor: '#f1f5f9',
  },
  dateRangeOptionActive: {
    backgroundColor: colors.primary,
  },
  dateRangeText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  dateRangeTextActive: {
    color: '#ffffff',
    fontWeight: '500',
  },
  payPeriodSelector: {
    marginBottom: spacing.md,
  },
  payPeriodList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    maxHeight: 150,
  },
  payPeriodOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  payPeriodOptionActive: {
    backgroundColor: '#f1f5f9',
  },
  payPeriodText: {
    fontSize: 14,
  },
  payPeriodTextActive: {
    fontWeight: '500',
    color: colors.primary,
  },
  dateField: {
    marginBottom: spacing.sm,
  },
  selectedDateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: spacing.sm,
    borderRadius: 4,
    marginTop: spacing.sm,
  },
  selectedDateRangeLabel: {
    fontWeight: '500',
    marginRight: spacing.sm,
    fontSize: 14,
  },
  selectedDateRangeText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  reportTypeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  reportTypeButtonActive: {
    backgroundColor: colors.primary,
  },
  reportTypeText: {
    color: colors.text.primary,
  },
  reportTypeTextActive: {
    color: '#ffffff',
    fontWeight: '500',
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  inactiveLabel: {
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    fontSize: 12,
  },
  buttonContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  generateButton: {
    marginBottom: spacing.sm,
  },
  resetButton: {
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
  },
  filterButtonText: {
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
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
    width: '50%',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  loadingText: {
    marginLeft: spacing.sm,
    color: colors.text.secondary,
  },
  errorContainer: {
    padding: spacing.md,
    backgroundColor: '#fee2e2',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#b91c1c',
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    marginLeft: spacing.md,
  },
  retryText: {
    color: colors.primary,
    fontWeight: '500',
  },
  noDataText: {
    padding: spacing.md,
    color: colors.text.secondary,
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
}); 