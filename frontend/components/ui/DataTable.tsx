import { View, ScrollView } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ActivityIndicator } from 'react-native';
import { commonStyles, spacing } from '@/styles/common';

interface Column<T> {
  key: keyof T | 'actions';
  title: string;
  render?: (value: any, item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
}

export function DataTable<T>({ data, columns, isLoading }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <View style={{ padding: spacing.xl, alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView 
      horizontal 
      testID="data-table-scroll-container"
    >
      <View testID="data-table-container">
        <View 
          testID="data-table-header" 
          style={commonStyles.tableContainer.headerRow}
        >
          {columns.map((column) => (
            <View 
              key={column.key as string} 
              testID={`header-cell-${column.key}`}
              style={commonStyles.tableContainer.headerCell}
            >
              <ThemedText type="defaultSemiBold">{column.title}</ThemedText>
            </View>
          ))}
        </View>

        {data.map((item, rowIndex) => (
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