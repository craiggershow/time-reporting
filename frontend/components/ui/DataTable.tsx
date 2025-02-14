import { View, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ActivityIndicator } from 'react-native';
import { commonStyles, spacing, colors, baseColors } from '@/styles/common';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from './Checkbox';

interface Column<T> {
  key: keyof T | 'actions' | 'select';
  title: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
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
      setSortDirection(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc');
      if (sortDirection === 'desc') {
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDirection) return 0;
    
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

  const columnsWithSelection = [
    ...(selectedIds ? [{
      key: 'select',
      title: (
        <Checkbox
          value={data.length > 0 && selectedIds.length === data.length}
          onValueChange={(checked) => {
            if (onSelectionChange) {
              onSelectionChange(checked ? data.map(item => getItemId(item)) : []);
            }
          }}
        />
      ),
      width: 50,
      render: (_: any, item: T) => (
        <Checkbox
          value={selectedIds.includes(getItemId(item))}
          onValueChange={(checked) => {
            if (onSelectionChange) {
              onSelectionChange(
                checked 
                  ? [...selectedIds, getItemId(item)]
                  : selectedIds.filter(id => id !== getItemId(item))
              );
            }
          }}
        />
      ),
    }] : []),
    ...columns,
  ];

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
        <View style={commonStyles.adminTable.header}>
          {columnsWithSelection.map((column) => (
            <Pressable
              key={column.key as string}
              testID={`header-cell-${column.key}`}
              style={[
                commonStyles.adminTable.headerCell,
                { width: column.width || 120 },
              ]}
              onPress={() => column.sortable && handleSort(column.key as keyof T)}
            >
              <View style={[
                commonStyles.adminTable.headerContent,
                { width: '100%' }
              ]}>
                <ThemedText style={commonStyles.adminTable.headerText}>
                  {column.title}
                </ThemedText>
                {column.sortable && sortKey === column.key && (
                  <Ionicons 
                    name={sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'} 
                    size={16} 
                    color={baseColors.textLight}
                  />
                )}
              </View>
            </Pressable>
          ))}
        </View>
        
        {sortedData.map((item) => (
          <View key={getItemId(item)} style={commonStyles.adminTable.row}>
            {columnsWithSelection.map((column) => (
              <View 
                key={column.key as string}
                style={[
                  commonStyles.adminTable.cell,
                  { width: column.width || 120 },
                  column.key === 'select' && { 
                    width: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
                ]}
              >
                {column.render 
                  ? column.render(item[column.key], item)
                  : <ThemedText style={{ textAlign: 'center', width: '100%' }}>{String(item[column.key])}</ThemedText>
                }
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