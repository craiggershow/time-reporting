import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ActivityIndicator } from 'react-native';

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView horizontal>
      <View>
        {/* Header Row */}
        <View style={styles.headerRow}>
          {columns.map((column) => (
            <View key={column.key as string} style={styles.headerCell}>
              <ThemedText type="defaultSemiBold">{column.title}</ThemedText>
            </View>
          ))}
        </View>

        {/* Data Rows */}
        {data.map((item, rowIndex) => (
          <View key={rowIndex} style={styles.dataRow}>
            {columns.map((column) => (
              <View key={column.key as string} style={styles.dataCell}>
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
          <View style={styles.emptyState}>
            <ThemedText>No data available</ThemedText>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  headerCell: {
    padding: 12,
    minWidth: 120,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dataCell: {
    padding: 12,
    minWidth: 120,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
}); 