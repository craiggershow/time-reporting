import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={() => setIsOpen(!isOpen)}
      >
        <ThemedText style={styles.title}>{title}</ThemedText>
        <IconSymbol 
          name={isOpen ? "chevron.up" : "chevron.down"} 
          color={Colors.text} 
          size={20} 
        />
      </TouchableOpacity>
      {isOpen && (
        <ThemedView style={styles.content}>
          {children}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
