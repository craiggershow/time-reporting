import React, { useEffect, useState, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Checkbox } from '../ui/Checkbox';
import { SafeDateTimePicker } from '../ui/SafeDateTimePicker';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/styles/common';
import { buildApiUrl } from '@/constants/Config';

interface ReportFiltersProps {
  onApplyFilters: (filters: ReportFilters) => void;
  onResetFilters: () => void;
}

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  employeeIds: string[];
  reportType: 'summary' | 'detailed';
  includeInactive: boolean;
  payPeriodId?: string;
  dateRangeType: DateRangeType;
}

export type DateRangeType = 'payPeriod' | 'currentMonth' | 'previousMonth' | 'ytd' | 'custom';

interface PayPeriod {
  id: string;
  startDate: string;
  endDate: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

// Add these utility functions at the top of the file
function getFirstDayOfMonth(): Date {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getLastDayOfMonth(): Date {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  date.setHours(23, 59, 59, 999);
  return date;
}

// Simple debounce function
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function(...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function ReportFilters({ onApplyFilters, onResetFilters }: ReportFiltersProps) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isWideScreen = width > 1200;
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [reportType, setReportType] = useState<'summary' | 'detailed'>('summary');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('payPeriod');
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [selectedPayPeriodId, setSelectedPayPeriodId] = useState<string>('');
  const [isLoadingPayPeriods, setIsLoadingPayPeriods] = useState(false);
  const [payPeriodsError, setPayPeriodsError] = useState<string | null>(null);
  const [isInitialSetupComplete, setIsInitialSetupComplete] = useState(false);
  
  // New state variables for employee data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const [employeePage, setEmployeePage] = useState(1);
  const [hasMoreEmployees, setHasMoreEmployees] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);
  
  // Define handleApplyFilters as a useCallback to avoid dependency issues
  const handleApplyFilters = useCallback(() => {
    onApplyFilters({
      startDate,
      endDate,
      employeeIds: selectedEmployees,
      reportType,
      includeInactive,
      payPeriodId: dateRangeType === 'payPeriod' ? selectedPayPeriodId : undefined,
      dateRangeType,
    });
  }, [
    startDate, 
    endDate, 
    selectedEmployees, 
    reportType, 
    includeInactive, 
    dateRangeType, 
    selectedPayPeriodId, 
    onApplyFilters
  ]);
  
  // Fetch employees with pagination and search
  const fetchEmployees = useCallback(async (page = 1, search = '', includeInactive = false) => {
    try {
      setEmployeesError(null);
      setIsLoadingEmployees(true);
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '50', // Fetch 50 employees at a time
        ...(search && { search }),
        ...(includeInactive && { includeInactive: 'true' })
      }).toString();
      
      console.log(`Fetching employees: ${buildApiUrl('EMPLOYEES')}?${queryParams}`);
      
      const response = await fetch(`${buildApiUrl('EMPLOYEES')}?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if the response has the expected structure
      if (!data.employees || !data.pagination) {
        console.error('Unexpected API response format:', data);
        throw new Error('Unexpected API response format');
      }
      
      // If it's the first page, replace the employees array
      // Otherwise, append to the existing array
      if (page === 1) {
        setEmployees(data.employees);
      } else {
        setEmployees(prev => [...prev, ...data.employees]);
      }
      
      setTotalEmployees(data.pagination.totalCount);
      setHasMoreEmployees(page < data.pagination.totalPages);
      setEmployeePage(page);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployeesError('Failed to load employees. Please try again.');
    } finally {
      setIsLoadingEmployees(false);
    }
  }, []);
  
  // Create a debounced search function
  const debouncedSearch = useCallback(
    (search: string, includeInactive: boolean) => {
      const debouncedFn = debounce((s: string, i: boolean) => {
        fetchEmployees(1, s, i);
      }, 300);
      debouncedFn(search, includeInactive);
    },
    [fetchEmployees]
  );
  
  // Load more employees when scrolling
  const loadMoreEmployees = useCallback(() => {
    if (!isLoadingEmployees && hasMoreEmployees) {
      fetchEmployees(employeePage + 1, employeeSearchQuery, includeInactive);
    }
  }, [isLoadingEmployees, hasMoreEmployees, employeePage, employeeSearchQuery, includeInactive, fetchEmployees]);
  
  // Effect to fetch employees on initial load
  useEffect(() => {
    fetchEmployees(1, '', includeInactive);
  }, [fetchEmployees]);
  
  // Effect to handle search and include inactive changes
  useEffect(() => {
    debouncedSearch(employeeSearchQuery, includeInactive);
  }, [employeeSearchQuery, includeInactive, debouncedSearch]);

  useEffect(() => {
    fetchPayPeriods();
  }, []);

  useEffect(() => {
    // Update date range based on selected type
    updateDateRange(dateRangeType);
  }, [dateRangeType, selectedPayPeriodId]);

  // Auto-apply filters when initial setup is complete
  useEffect(() => {
    // Check if we have the necessary data to generate a report
    if (payPeriods.length > 0 && selectedPayPeriodId && !isInitialSetupComplete) {
      // Mark setup as complete to prevent multiple report generations
      setIsInitialSetupComplete(true);
      
      // Apply filters with default parameters
      handleApplyFilters();
    }
  }, [payPeriods, selectedPayPeriodId, isInitialSetupComplete, handleApplyFilters]);

  const fetchPayPeriods = async () => {
    try {
      setIsLoadingPayPeriods(true);
      setPayPeriodsError(null);
      
      // Using mock data since the API endpoint is not available
      console.log('Using mock pay periods data');
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
      
      setPayPeriodsError(null);
    } catch (error) {
      console.error('Failed to generate mock pay periods:', error);
      setPayPeriodsError('Failed to load pay periods. Please try again.');
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
    const filteredEmployees = employees.filter(
      employee => includeInactive || employee.isActive
    );
    
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  const handleResetFilters = () => {
    setDateRangeType('currentMonth');
    setSelectedPayPeriodId('');
    setStartDate(getFirstDayOfMonth());
    setEndDate(getLastDayOfMonth());
    setReportType('summary');
    
    // Reset to all active employees
    const activeEmployeeIds = employees
      .filter(employee => employee.isActive)
      .map(employee => employee.id);
    
    setSelectedEmployees(activeEmployeeIds);
    setIncludeInactive(false);
    setShowEmployeeSelector(false);
    setEmployeeSearchQuery('');
  };

  const renderDateRangeSelector = () => {
    return (
      <View style={styles.dateRangeSelector}>
        <TouchableOpacity 
          style={[
            styles.dateRangeOption, 
            dateRangeType === 'payPeriod' && styles.dateRangeOptionActive,
            isWeb && styles.webDateRangeOption
          ]}
          onPress={() => setDateRangeType('payPeriod')}
        >
          <ThemedText style={[styles.dateRangeText, dateRangeType === 'payPeriod' && styles.dateRangeTextActive]}>
            Pay Period
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.dateRangeOption, 
            dateRangeType === 'currentMonth' && styles.dateRangeOptionActive,
            isWeb && styles.webDateRangeOption
          ]}
          onPress={() => setDateRangeType('currentMonth')}
        >
          <ThemedText style={[styles.dateRangeText, dateRangeType === 'currentMonth' && styles.dateRangeTextActive]}>
            Current Month
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.dateRangeOption, 
            dateRangeType === 'previousMonth' && styles.dateRangeOptionActive,
            isWeb && styles.webDateRangeOption
          ]}
          onPress={() => setDateRangeType('previousMonth')}
        >
          <ThemedText style={[styles.dateRangeText, dateRangeType === 'previousMonth' && styles.dateRangeTextActive]}>
            Previous Month
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.dateRangeOption, 
            dateRangeType === 'ytd' && styles.dateRangeOptionActive,
            isWeb && styles.webDateRangeOption
          ]}
          onPress={() => setDateRangeType('ytd')}
        >
          <ThemedText style={[styles.dateRangeText, dateRangeType === 'ytd' && styles.dateRangeTextActive]}>
            Year to Date
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.dateRangeOption, 
            dateRangeType === 'custom' && styles.dateRangeOptionActive,
            isWeb && styles.webDateRangeOption
          ]}
          onPress={() => setDateRangeType('custom')}
        >
          <ThemedText style={[styles.dateRangeText, dateRangeType === 'custom' && styles.dateRangeTextActive]}>
            Custom
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPayPeriodSelector = () => {
    if (dateRangeType !== 'payPeriod') return null;

    return (
      <View style={styles.payPeriodSelector}>
        <ThemedText style={styles.payPeriodLabel}>Select Pay Period:</ThemedText>
        
        {isLoadingPayPeriods ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner message="Loading pay periods..." />
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
      <View style={styles.dateContainer}>
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
      </View>
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderSelectedDateRange = () => {
    return (
      <View style={styles.selectedDateRange}>
        <ThemedText style={styles.selectedDateRangeLabel}>Selected Range:</ThemedText>
        <ThemedText style={styles.selectedDateRangeText}>
          {formatDate(startDate)} - {formatDate(endDate)}
        </ThemedText>
      </View>
    );
  };

  const renderReportTypeSelector = () => {
    return (
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
    );
  };

  const renderEmployeeSelector = () => {
    return (
      <View style={styles.employeeSelector}>
        <TouchableOpacity 
          style={styles.employeeSelector}
          onPress={() => setShowEmployeeSelector(!showEmployeeSelector)}
        >
          <ThemedText>
            {selectedEmployees.length === 0 
              ? 'All Employees' 
              : `${selectedEmployees.length} Selected`}
          </ThemedText>
          <Ionicons 
            name={showEmployeeSelector ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={colors.text.primary} 
          />
        </TouchableOpacity>

        {showEmployeeSelector && (
          <View style={styles.employeeList}>
            <Input
              placeholder="Search employees..."
              value={employeeSearchQuery}
              onChangeText={setEmployeeSearchQuery}
              leftIcon="search"
              label="Search"
            />
            
            <View style={styles.selectAllContainer}>
              <Checkbox
                label="Select All"
                value={selectedEmployees.length === employees.length && employees.length > 0}
                onValueChange={handleSelectAllEmployees}
              />
              <Checkbox
                label="Include Inactive"
                value={includeInactive}
                onValueChange={setIncludeInactive}
              />
            </View>

            {employeesError ? (
              <ErrorMessage 
                message={employeesError} 
                onRetry={() => fetchEmployees(1, employeeSearchQuery, includeInactive)} 
              />
            ) : employees.length > 0 ? (
              <>
                {employees.map(employee => (
                  <View key={employee.id} style={styles.employeeItem}>
                    <Checkbox
                      label={`${employee.name} (${employee.email})`}
                      value={selectedEmployees.includes(employee.id)}
                      onValueChange={() => handleEmployeeToggle(employee.id)}
                    />
                    {!employee.isActive && (
                      <ThemedText style={styles.inactiveLabel}>(Inactive)</ThemedText>
                    )}
                  </View>
                ))}
                
                {hasMoreEmployees && (
                  <TouchableOpacity 
                    style={styles.loadMoreButton} 
                    onPress={loadMoreEmployees}
                    disabled={isLoadingEmployees}
                  >
                    {isLoadingEmployees ? (
                      <LoadingSpinner message="Loading more..." />
                    ) : (
                      <ThemedText>Load More ({totalEmployees - employees.length} remaining)</ThemedText>
                    )}
                  </TouchableOpacity>
                )}
              </>
            ) : isLoadingEmployees ? (
              <View style={styles.loadingContainer}>
                <LoadingSpinner message="Loading employees..." />
              </View>
            ) : (
              <ThemedText style={styles.noResultsText}>No employees found</ThemedText>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      <View style={[styles.header, isWeb && styles.webHeader]}>
        <ThemedText type="subtitle">Report Filters</ThemedText>
        <TouchableOpacity onPress={handleResetFilters}>
          <ThemedText style={styles.resetText}>Reset</ThemedText>
        </TouchableOpacity>
      </View>

      {isWeb && isWideScreen ? (
        // Wide screen web layout - horizontal arrangement
        <View style={styles.webFilterLayout}>
          <View style={styles.webFilterColumn}>
            <View style={[styles.filterSection, styles.webFilterSection]}>
              <ThemedText style={styles.sectionTitle}>Date Range</ThemedText>
              {renderDateRangeSelector()}
              {renderPayPeriodSelector()}
              {renderCustomDateRange()}
              {renderSelectedDateRange()}
            </View>
          </View>
          
          <View style={styles.webFilterColumn}>
            <View style={[styles.filterSection, styles.webFilterSection]}>
              <ThemedText style={styles.sectionTitle}>Report Type</ThemedText>
              {renderReportTypeSelector()}
            </View>
            
            <View style={[styles.filterSection, styles.webFilterSection]}>
              <ThemedText style={styles.sectionTitle}>Employees</ThemedText>
              {renderEmployeeSelector()}
            </View>
          </View>
          
          <View style={styles.webButtonColumn}>
            <Button
              onPress={handleApplyFilters}
              style={styles.applyButton}
              leftIcon="analytics-outline"
            >
              Apply Filters
            </Button>
          </View>
        </View>
      ) : (
        // Standard layout - vertical arrangement
        <>
          <View style={styles.filterSection}>
            <ThemedText style={styles.sectionTitle}>Date Range</ThemedText>
            {renderDateRangeSelector()}
            {renderPayPeriodSelector()}
            {renderCustomDateRange()}
            {renderSelectedDateRange()}
          </View>

          <View style={styles.filterSection}>
            <ThemedText style={styles.sectionTitle}>Report Type</ThemedText>
            {renderReportTypeSelector()}
          </View>

          <View style={styles.filterSection}>
            <ThemedText style={styles.sectionTitle}>Employees</ThemedText>
            {renderEmployeeSelector()}
          </View>

          <Button
            onPress={handleApplyFilters}
            style={styles.applyButton}
            leftIcon="analytics-outline"
          >
            Apply Filters
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    zIndex: 1,
  },
  webContainer: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  webHeader: {
    marginBottom: spacing.sm,
  },
  resetText: {
    color: colors.primary,
    fontWeight: '500',
  },
  filterSection: {
    marginBottom: spacing.lg,
    position: 'relative',
    zIndex: 1,
  },
  webFilterSection: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  dateRangeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  dateRangeOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 4,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: '#f1f5f9',
  },
  webDateRangeOption: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
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
  // Web-specific layout styles
  webFilterLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  webFilterColumn: {
    flex: 1,
    marginRight: spacing.md,
  },
  webButtonColumn: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingTop: 20,
  },
  payPeriodSelector: {
    marginBottom: spacing.md,
    position: 'relative',
    zIndex: 5,
  },
  payPeriodLabel: {
    marginBottom: spacing.sm,
  },
  payPeriodList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    maxHeight: 200,
    zIndex: 10,
    position: 'relative',
    overflow: 'scroll',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
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
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  dateField: {
    flex: 1,
    marginRight: spacing.md,
  },
  selectedDateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: spacing.sm,
    borderRadius: 4,
  },
  selectedDateRangeLabel: {
    fontWeight: '500',
    marginRight: spacing.sm,
  },
  selectedDateRangeText: {
    color: colors.text.secondary,
  },
  employeeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: spacing.md,
  },
  employeeList: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: spacing.md,
  },
  selectAllContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.md,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  inactiveLabel: {
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    fontSize: 12,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
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
  applyButton: {
    marginTop: spacing.md,
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
  loadMoreButton: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 8,
  },
  noResultsText: {
    padding: 16,
    textAlign: 'center',
    color: colors.text.secondary,
  },
}); 