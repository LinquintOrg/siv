import { Feather } from '@expo/vector-icons';
import type { FlashListRef } from '@shopify/flash-list';
import { useState, type RefObject } from 'react';
import { Pressable, StyleSheet, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { GUTTER, q } from '@/theme';

// About two screens of scrolling before the button is worth showing
const THRESHOLD = 1200;

/** Scroll handler and button state for a list that gets a back-to-top button. */
export function useScrollTop<T>(list: RefObject<FlashListRef<T> | null>) {
  const [ visible, setVisible ] = useState(false);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const past = e.nativeEvent.contentOffset.y > THRESHOLD;
    if (past !== visible) {
      setVisible(past);
    }
  };

  const scrollToTop = () => list.current?.scrollToOffset({ offset: 0, animated: true });

  return { visible, onScroll, scrollToTop };
}

/** Round button in the bottom-right corner of a long list. */
export function ScrollTopButton({ visible, onPress, bottom = 0 }: { visible: boolean; onPress: () => void; bottom?: number }) {
  if (!visible) {
    return null;
  }
  return (
    <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={[ styles.wrap, { bottom: bottom + 16 } ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to top"
        onPress={onPress}
        hitSlop={6}
        style={({ pressed }) => [ styles.button, { opacity: pressed ? 0.7 : 1 } ]}
      >
        <Feather name="arrow-up" size={18} color={q.text} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: GUTTER,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: q.raised,
    borderWidth: 1,
    borderColor: q.line3,
  },
});
