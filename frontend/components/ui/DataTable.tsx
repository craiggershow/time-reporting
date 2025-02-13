import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ActivityIndicator } from 'react-native';
import { commonStyles, spacing } from '@/styles/common';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface Column<T> {
  key: keyof T | 'actions';
  title: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T>({ data, columns, isLoading }: DataTableProps<T>) {
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
          {columns.map((column) => (
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
                <ThemedText type="defaultSemiBold">{column.title}</ThemedText>
                {column.sortable && sortKey === column.key && (
                  <Ionicons 
                    name={sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'} 
                    size={16} 
                    color="#64748b"
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
            style={commonStyles.tableContainer.row}
          >
            {columns.map((column) => (
              <View
                key={column.key as string}
                testID={`table-cell-${column.key}-${rowIndex}`}
                style={commonStyles.tableContainer.cell}
              >
                {column.render ? (
                  column.render(item[column.key], item)
                ) : (
                  <ThemedText>{String(item[column.key])}</ThemedText>
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
}); 