import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SafeDateTimePicker } from '@/components/ui/SafeDateTimePicker';
import { Checkbox } from '@/components/ui/Checkbox';
import { colors, spacing } from '@/styles/common';
import { Ionicons } from '@expo/vector-icons';
import { buildApiUrl } from '@/constants/Config';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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

export function ReportFilters({ onApplyFilters, onResetFilters }: ReportFiltersProps) {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [reportType, setReportType] = useState<'summary' | 'detailed'>('summary');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
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

  const filteredEmployees = employees.filter(
    employee => 
      (includeInactive || employee.isActive) && 
      (employee.name.toLowerCase().includes(employeeSearchQuery.toLowerCase()) || 
       employee.email.toLowerCase().includes(employeeSearchQuery.toLowerCase()))
  );

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId) 
        : [...prev, employeeId]
    );
  };

  const handleSelectAllEmployees = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      startDate,
      endDate,
      employeeIds: selectedEmployees,
      reportType,
      includeInactive,
      payPeriodId: dateRangeType === 'payPeriod' ? selectedPayPeriodId : undefined,
      dateRangeType,
    });
  };

  const renderDateRangeSelector = () => {
    return (
      <View style={styles.dateRangeSelector}>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Report Filters</ThemedText>
        <TouchableOpacity onPress={onResetFilters}>
          <ThemedText style={styles.resetText}>Reset</ThemedText>
        </TouchableOpacity>
      </View>

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
        <ThemedText style={styles.sectionTitle}>Employees</ThemedText>
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
            />
            
            <View style={styles.selectAllContainer}>
              <Checkbox
                label="Select All"
                value={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                onValueChange={handleSelectAllEmployees}
              />
              <Checkbox
                label="Include Inactive"
                value={includeInactive}
                onValueChange={setIncludeInactive}
              />
            </View>

            {filteredEmployees.map(employee => (
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
          </View>
        )}
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

      <Button 
        label="Apply Filters" 
        onPress={handleApplyFilters} 
        style={styles.applyButton}
      />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resetText: {
    color: colors.primary,
    fontWeight: '500',
  },
  filterSection: {
    marginBottom: spacing.lg,
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
  payPeriodLabel: {
    marginBottom: spacing.sm,
  },
  payPeriodList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    maxHeight: 200,
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
}); 