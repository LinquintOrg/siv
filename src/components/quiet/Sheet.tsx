import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Portal } from 'react-native-paper';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UnderlineInput } from '@/components/quiet/Controls';
import { Text } from '@/components/quiet/Text';
import { GUTTER, q } from '@/theme';

export interface SheetOption<T extends string | number> {
  value: T;
  label: string;
  sub?: string;
  image?: string;
}

interface Props<T extends string | number> {
  open: boolean;
  onClose: () => void;
  kicker?: string;
  title: string;
  options: SheetOption<T>[];
  selected?: T | null;
  onSelect: (value: T) => void;
  searchPlaceholder?: string;
}

/** Bottom sheet with a single-choice list — the app's dropdown. */
export function OptionSheet<T extends string | number>({ open, onClose, kicker, title, options, selected, onSelect, searchPlaceholder }: Props<T>) {
  const insets = useSafeAreaInsets();
  const [ query, setQuery ] = useState('');
  const q2 = query.trim().toLowerCase();
  const visible = searchPlaceholder && q2
    ? options.filter(o => o.label.toLowerCase().includes(q2) || o.sub?.toLowerCase().includes(q2))
    : options;

  const close = () => {
    setQuery('');
    onClose();
  };

  // The Android back button closes the sheet instead of leaving the screen
  useEffect(() => {
    if (!open) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setQuery('');
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [ open, onClose ]);

  // Drawn in the app's own window rather than a Modal, so the panel reaches the bottom edge behind the navigation bar
  if (!open) {
    return null;
  }
  return (
    <Portal>
      <KeyboardAvoidingView behavior="padding" style={styles.root}>
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(180)} style={[ StyleSheet.absoluteFill, { backgroundColor: q.backdrop } ]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityRole="button" accessibilityLabel="Close" />
        </Animated.View>
        <Animated.View
          entering={SlideInDown.duration(260).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(200).easing(Easing.in(Easing.cubic))}
          style={[ styles.panel, { paddingBottom: insets.bottom + 12 } ]}
          accessibilityViewIsModal
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerText}>
              {kicker ? <Text size={13} color={q.muted}>{kicker}</Text> : null}
              <Text size={26} weight="extralight" tracking={-0.03}>{title}</Text>
            </View>
            <Pressable onPress={close} hitSlop={10} accessibilityRole="button">
              <Text size={14} color={q.muted}>Done</Text>
            </Pressable>
          </View>
          {searchPlaceholder ? (
            <View style={styles.search}>
              <UnderlineInput icon="search" value={query} onChangeText={setQuery} placeholder={searchPlaceholder} accessibilityLabel={searchPlaceholder} />
            </View>
          ) : null}
          <ScrollView keyboardShouldPersistTaps="handled" accessibilityRole="list">
            {visible.map(option => {
              const isSelected = option.value === selected;
              return (
                <Pressable
                  key={String(option.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => {
                    setQuery('');
                    onSelect(option.value);
                  }}
                  style={({ pressed }) => [ styles.option, pressed && { backgroundColor: q.hover } ]}
                >
                  <View style={[ styles.dot, { backgroundColor: isSelected ? q.accent : 'transparent' } ]} />
                  {option.image ? <Image source={{ uri: option.image }} style={styles.image} contentFit="cover" /> : null}
                  <Text size={16} color={isSelected ? q.accent : q.soft} style={styles.label} numberOfLines={1}>{option.label}</Text>
                  {option.sub ? <Text size={12} mono color={q.faint}>{option.sub}</Text> : null}
                </Pressable>
              );
            })}
            {visible.length === 0 ? <Text size={14} color={q.dim} style={styles.empty}>No matches</Text> : null}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Portal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    maxHeight: '74%',
    backgroundColor: q.sheet,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: q.line3,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: q.line3,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: GUTTER + 2,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerText: {
    gap: 4,
  },
  search: {
    paddingHorizontal: GUTTER + 2,
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 52,
    paddingHorizontal: GUTTER + 2,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1D',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  image: {
    width: 22,
    height: 22,
    borderRadius: 5,
  },
  label: {
    flex: 1,
  },
  empty: {
    paddingHorizontal: GUTTER + 2,
    paddingVertical: 16,
  },
});
