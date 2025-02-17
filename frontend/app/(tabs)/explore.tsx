import { StyleSheet, Image, Platform, View } from 'react-native';

import { Collapsible } from '@/components/ui/Collapsible';
import { ExternalLink } from '@/components/ui/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors, spacing } from '@/styles/common';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Collapsible title="Color Themes">
        <View style={styles.content}>
          <ThemedText>
            This template has light and dark mode support.{' '}
            <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText>
            {' '}hook lets you inspect what the user's current color scheme is, 
            and so you can adjust UI colors accordingly.
          </ThemedText>
          <ExternalLink 
            href="https://docs.expo.dev/develop/user-interface/color-themes/"
            style={styles.link}
          >
            <ThemedText type="link">Learn more</ThemedText>
          </ExternalLink>
        </View>
      </Collapsible>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background.page,
  },
  content: {
    gap: spacing.sm,
  },
  link: {
    marginTop: spacing.xs,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
