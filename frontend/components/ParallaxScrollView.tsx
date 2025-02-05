import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useTheme } from '@/hooks/useTheme';

const HEADER_HEIGHT = 250;

interface Props extends PropsWithChildren {
  HeaderComponent: ReactElement;
  contentContainerStyle?: any;
}

export function ParallaxScrollView({
  children,
  HeaderComponent,
  contentContainerStyle,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const { setOverflowHeight } = useBottomTabOverflow();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.View style={[styles.header, headerStyle]}>
        {HeaderComponent}
      </Animated.View>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollView,
          { paddingBottom: insets.bottom },
          contentContainerStyle,
        ]}
        style={{ backgroundColor: colors.background }}
      >
        <ThemedView style={[styles.content, { marginTop: HEADER_HEIGHT }]}>
          {children}
        </ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    overflow: 'hidden',
  },
  scrollView: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
});
