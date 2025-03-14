import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  Animated,
  Dimensions,
  Pressable,
  Platform,
  TextStyle
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SafeDateTimePicker } from '@/components/ui/SafeDateTimePicker';
import { Checkbox } from '@/components/ui/Checkbox';
import { colors, spacing } from '@/styles/common';
import { Ionicons } from '@expo/vector-icons';
import { DateRangeType } from './ReportFilters';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

interface PayPeriod {
  id: string;
  startDate: string;
  endDate: string;
  name: string;
}

interface MobileReportFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  startDate: Date;
  endDate: Date;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  reportType: 'summary' | 'detailed';
  setReportType: (type: 'summary' | 'detailed') => void;
  selectedEmployees: string[];
  setSelectedEmployees: Dispatch<SetStateAction<string[]>>;
  includeInactive: boolean;
  setIncludeInactive: (include: boolean) => void;
  dateRangeType: DateRangeType;
  setDateRangeType: (type: DateRangeType) => void;
  payPeriods: PayPeriod[];
  selectedPayPeriodId: string;
  setSelectedPayPeriodId: (id: string) => void;
  isLoadingPayPeriods: boolean;
  payPeriodsError: string | null;
  fetchPayPeriods: () => void;
  employees: { id: string; name: string; email: string; isActive: boolean }[];
  isLoadingEmployees: boolean;
  employeesError: string | null;
}

export function MobileReportFilterSheet({
  visible,
  onClose,
  onApplyFilters,
  onResetFilters,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  reportType,
  setReportType,
  selectedEmployees,
  setSelectedEmployees,
  includeInactive,
  setIncludeInactive,
  dateRangeType,
  setDateRangeType,
  payPeriods,
  selectedPayPeriodId,
  setSelectedPayPeriodId,
  isLoadingPayPeriods,
  payPeriodsError,
  fetchPayPeriods,
  employees,
  isLoadingEmployees,
  employeesError
}: MobileReportFilterSheetProps) {
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<'date' | 'employees' | 'type'>('date');
  const [slideAnim] = useState(new Animated.Value(Dimensions.get('window').height));

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredEmployees = employees.filter(
    employee => 
      (includeInactive || employee.isActive) && 
      (employee.name.toLowerCase().includes(employeeSearchQuery.toLowerCase()) || 
       employee.email.toLowerCase().includes(employeeSearchQuery.toLowerCase()))
  );

  const renderDateRangeSelector = () => {
    return (
      <View style={styles.dateRangeSelectorContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRangeSelectorContent}
        >
          <TouchableOpacity 
            style={[styles.dateRangeOption, dateRangeType === 'payPeriod' && styles.dateRangeOptionActive]}
            onPress={() => setDateRangeType('payPeriod')}
          >
            <ThemedText style={dateRangeType === 'payPeriod' ? styles.dateRangeTextActive : styles.dateRangeText}>
              Pay Period
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.dateRangeOption, dateRangeType === 'currentMonth' && styles.dateRangeOptionActive]}
            onPress={() => setDateRangeType('currentMonth')}
          >
            <ThemedText style={dateRangeType === 'currentMonth' ? styles.dateRangeTextActive : styles.dateRangeText}>
              Current Month
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.dateRangeOption, dateRangeType === 'previousMonth' && styles.dateRangeOptionActive]}
            onPress={() => setDateRangeType('previousMonth')}
          >
            <ThemedText style={dateRangeType === 'previousMonth' ? styles.dateRangeTextActive : styles.dateRangeText}>
              Previous Month
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.dateRangeOption, dateRangeType === 'ytd' && styles.dateRangeOptionActive]}
            onPress={() => setDateRangeType('ytd')}
          >
            <ThemedText style={dateRangeType === 'ytd' ? styles.dateRangeTextActive : styles.dateRangeText}>
              Year to Date
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.dateRangeOption, dateRangeType === 'custom' && styles.dateRangeOptionActive]}
            onPress={() => setDateRangeType('custom')}
          >
            <ThemedText style={dateRangeType === 'custom' ? styles.dateRangeTextActive : styles.dateRangeText}>
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
        <ThemedText style={styles.sectionTitle}>Select Pay Period:</ThemedText>
        
        {isLoadingPayPeriods ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="hourglass-outline" size={20} color={colors.text.secondary} />
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
          <View style={styles.payPeriodListContainer}>
            <ScrollView style={styles.payPeriodList}>
              {payPeriods.map(period => (
                <TouchableOpacity
                  key={period.id}
                  style={[
                    styles.payPeriodOption,
                    selectedPayPeriodId === period.id && styles.payPeriodOptionActive
                  ]}
                  onPress={() => setSelectedPayPeriodId(period.id)}
                >
                  <View style={styles.payPeriodOptionContent}>
                    <ThemedText style={selectedPayPeriodId === period.id ? styles.payPeriodTextActive : styles.payPeriodText}>
                      {period.name}
                    </ThemedText>
                    {selectedPayPeriodId === period.id && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderCustomDateRange = () => {
    if (dateRangeType !== 'custom') return null;

    return (
      <View style={styles.customDateRangeContainer}>
        <ThemedText style={styles.sectionTitle}>Custom Date Range:</ThemedText>
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

  const renderSelectedDateRange = () => {
    return (
      <View style={styles.selectedDateRange}>
        <View style={styles.selectedDateRangeHeader}>
          <ThemedText style={styles.selectedDateRangeLabel}>Selected Range:</ThemedText>
          <TouchableOpacity 
            onPress={() => setDateRangeType('custom')}
            style={styles.editDateRangeButton}
          >
            <ThemedText style={styles.editDateRangeText}>Edit</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.selectedDateRangeContent}>
          <ThemedText style={styles.selectedDateRangeText}>
            {formatDate(startDate)} - {formatDate(endDate)}
          </ThemedText>
        </View>
      </View>
    );
  };

  const renderReportTypeSelector = () => {
    return (
      <View style={styles.reportTypeWrapper}>
        <ThemedText style={styles.sectionTitle}>Report Type:</ThemedText>
        <View style={styles.reportTypeContainer}>
          <TouchableOpacity 
            style={[
              styles.reportTypeButton, 
              reportType === 'summary' && styles.reportTypeButtonActive
            ]}
            onPress={() => setReportType('summary')}
          >
            <Ionicons 
              name="list-outline" 
              size={20} 
              color={reportType === 'summary' ? '#ffffff' : colors.text.primary} 
            />
            <ThemedText 
              style={reportType === 'summary' ? styles.reportTypeTextActive : styles.reportTypeText}
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
            <Ionicons 
              name="document-text-outline" 
              size={20} 
              color={reportType === 'detailed' ? '#ffffff' : colors.text.primary} 
            />
            <ThemedText 
              style={reportType === 'detailed' ? styles.reportTypeTextActive : styles.reportTypeText}
            >
              Detailed
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmployeeSelector = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.employeeSelectorHeader}>
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
        </View>

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
                checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                onValueChange={handleSelectAllEmployees}
                label="Select All"
              />
              <Checkbox
                checked={includeInactive}
                onValueChange={setIncludeInactive}
                label="Include Inactive"
              />
            </View>

            {employeesError ? (
              <ErrorMessage 
                message={employeesError} 
              />
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map(employee => (
                <View key={employee.id} style={styles.employeeItem}>
                  <Checkbox
                    checked={selectedEmployees.includes(employee.id)}
                    onValueChange={() => handleEmployeeToggle(employee.id)}
                    label={`${employee.name} (${employee.email})`}
                  />
                  {!employee.isActive && (
                    <ThemedText style={styles.inactiveLabel}>(Inactive)</ThemedText>
                  )}
                </View>
              ))
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'date':
        return (
          <View style={styles.tabContent}>
            {renderDateRangeSelector()}
            {renderPayPeriodSelector()}
            {renderCustomDateRange()}
            {renderSelectedDateRange()}
          </View>
        );
      case 'employees':
        return (
          <View style={styles.tabContent}>
            {renderEmployeeSelector()}
          </View>
        );
      case 'type':
        return (
          <View style={styles.tabContent}>
            {renderReportTypeSelector()}
          </View>
        );
      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View 
          style={[
            styles.sheetContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <ThemedText type="subtitle">Report Filters</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'date' && styles.activeTab]} 
              onPress={() => setActiveTab('date')}
            >
              <Ionicons 
                name="calendar-outline" 
                size={20} 
                color={activeTab === 'date' ? colors.primary : colors.text.secondary} 
              />
              <ThemedText style={activeTab === 'date' ? styles.activeTabText : styles.tabText}>
                Dates
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'employees' && styles.activeTab]} 
              onPress={() => setActiveTab('employees')}
            >
              <Ionicons 
                name="people-outline" 
                size={20} 
                color={activeTab === 'employees' ? colors.primary : colors.text.secondary} 
              />
              <ThemedText style={activeTab === 'employees' ? styles.activeTabText : styles.tabText}>
                Employees
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'type' && styles.activeTab]} 
              onPress={() => setActiveTab('type')}
            >
              <Ionicons 
                name="document-text-outline" 
                size={20} 
                color={activeTab === 'type' ? colors.primary : colors.text.secondary} 
              />
              <ThemedText style={activeTab === 'type' ? styles.activeTabText : styles.tabText}>
                Report Type
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            {renderTabContent()}
          </ScrollView>
          
          <View style={styles.footer}>
            <Button 
              variant="secondary" 
              label="Reset Filters" 
              onPress={onResetFilters}
              style={styles.resetButton}
              leftIcon="refresh-outline"
            />
            <Button 
              label="Apply Filters" 
              onPress={() => {
                onApplyFilters();
                onClose();
              }}
              style={styles.applyButton}
              leftIcon="checkmark-outline"
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24, // Extra padding for iOS devices with home indicator
    height: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  closeButton: {
    padding: spacing.xs,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    marginLeft: spacing.xs,
    fontSize: 14,
    color: colors.text.secondary,
  },
  activeTabText: {
    marginLeft: spacing.xs,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  tabContent: {
    paddingBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  resetButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  applyButton: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  dateRangeSelectorContainer: {
    marginBottom: spacing.md,
  },
  dateRangeSelectorContent: {
    paddingVertical: spacing.xs,
  },
  dateRangeOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    marginRight: spacing.sm,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateRangeOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateRangeText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  dateRangeTextActive: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  payPeriodSelector: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  payPeriodListContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginTop: spacing.xs,
    zIndex: 10,
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  payPeriodList: {
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
  payPeriodOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payPeriodText: {
    fontSize: 14,
  },
  payPeriodTextActive: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  customDateRangeContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  dateField: {
    marginBottom: spacing.sm,
  },
  selectedDateRange: {
    backgroundColor: '#f1f5f9',
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  selectedDateRangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  selectedDateRangeLabel: {
    fontWeight: '500',
    fontSize: 14,
  },
  selectedDateRangeContent: {
    backgroundColor: '#ffffff',
    padding: spacing.sm,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedDateRangeText: {
    color: colors.text.primary,
    fontSize: 14,
    textAlign: 'center',
  },
  editDateRangeButton: {
    padding: spacing.xs,
  },
  editDateRangeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  reportTypeWrapper: {
    marginTop: spacing.sm,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  reportTypeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  reportTypeButtonActive: {
    backgroundColor: colors.primary,
  },
  reportTypeText: {
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  reportTypeTextActive: {
    color: '#ffffff',
    fontWeight: '500',
  },
  employeeSelectorHeader: {
    marginTop: spacing.sm,
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
    backgroundColor: '#ffffff',
  },
  selectAllContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
  noResultsText: {
    textAlign: 'center',
    padding: spacing.md,
    color: colors.text.secondary,
  },
}); 