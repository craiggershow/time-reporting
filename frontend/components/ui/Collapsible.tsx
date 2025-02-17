import { View, Pressable, StyleSheet, LayoutAnimation } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '../ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/styles/common';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function Collapsible({ title, children, defaultExpanded = false }: CollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      <Pressable 
        onPress={toggleExpand}
        style={styles.header}
      >
        <ThemedText type="subtitle">{title}</ThemedText>
        <Ionicons 
          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
          size={24} 
          color={colors.text.secondary}
        />
      </Pressable>
      {isExpanded && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.card,
  },
  content: {
    padding: spacing.md,
    backgroundColor: colors.background.page,
  },
}); 