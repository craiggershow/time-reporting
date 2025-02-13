import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ActivityIndicator } from 'react-native';
import { commonStyles, spacing, colors } from '@/styles/common';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from './Checkbox';

interface Column<T> {
  key: keyof T | 'actions' | 'select';
  title: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  getItemId?: (item: T) => string;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T>({ 
  data, 
  columns, 
  isLoading,
  selectedIds = [],
  onSelectionChange,
  getItemId = (item: any) => item.id,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      // Toggle direction if same key
      setSortDirection(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc');
      if (sortDirection === 'desc') {
        setSortKey(null);
      }
    } else {
      // New sort key
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDirection) return 0;
    
    // Special handling for name field
    if (sortKey === 'name') {
      const aName = `${(a as any).firstName} ${(a as any).lastName}`;
      const bName = `${(b as any).firstName} ${(b as any).lastName}`;
      return sortDirection === 'asc' 
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName);
    }
    
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc'
      ? (aValue < bValue ? -1 : 1)
      : (bValue < aValue ? -1 : 1);
  });

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (selectedIds.length === sortedData.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(sortedData.map(item => getItemId(item)));
    }
  };

  const handleSelectItem = (item: T) => {
    if (!onSelectionChange) return;
    
    const id = getItemId(item);
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const renderSelectColumn = () => ({
    key: 'select',
    title: '',
    width: 48,
    render: (_: any, item: T) => (
      <View style={styles.checkboxCell}>
        <Checkbox
          checked={selectedIds.includes(getItemId(item))}
          onChange={() => handleSelectItem(item)}
        />
      </View>
    ),
  });

  const allColumns = onSelectionChange 
    ? [renderSelectColumn(), ...columns]
    : columns;

  if (isLoading) {
    return (
      <View style={{ padding: spacing.xl, alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView horizontal testID="data-table-scroll-container">
      <View testID="data-table-container">
        <View testID="data-table-header" style={commonStyles.tableContainer.headerRow}>
          {onSelectionChange && (
            <View style={commonStyles.tableContainer.headerCell}>
              <Checkbox
                checked={selectedIds.length === sortedData.length}
                onChange={handleSelectAll}
              />
            </View>
          )}
          {allColumns.map((column) => (
            <Pressable
              key={column.key as string}
              testID={`header-cell-${column.key}`}
              style={[
                commonStyles.tableContainer.headerCell,
                column.sortable && styles.sortableHeader
              ]}
              onPress={() => column.sortable && handleSort(column.key as keyof T)}
            >
              <View style={styles.headerContent}>
                <ThemedText style={commonStyles.lightText}>{column.title}</ThemedText>
                {column.sortable && sortKey === column.key && (
                  <Ionicons 
                    name={sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'} 
                    size={16} 
                    color={colors.text.light}
                  />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {sortedData.map((item, rowIndex) => (
          <View 
            key={rowIndex}
            testID={`table-row-${rowIndex}`}
            style={[
              commonStyles.tableContainer.row,
              rowIndex % 2 === 1 && { backgroundColor: colors.table.row.alternateBackground }
            ]}
          >
            {allColumns.map((column) => (
              <View
                key={column.key as string}
                testID={`table-cell-${column.key}-${rowIndex}`}
                style={commonStyles.tableContainer.cell}
              >
                {column.render ? (
                  column.render(item[column.key], item)
                ) : (
                  <ThemedText style={commonStyles.lightText}>{String(item[column.key])}</ThemedText>
                )}
              </View>
            ))}
          </View>
        ))}

        {data.length === 0 && (
          <View style={{ padding: spacing.xl, alignItems: 'center' }}>
            <ThemedText>No data available</ThemedText>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sortableHeader: {
    cursor: 'pointer',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkboxCell: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 