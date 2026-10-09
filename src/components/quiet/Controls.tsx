import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { forwardRef, useEffect, type ComponentProps, type ReactNode } from 'react';
import { Pressable, RefreshControl, StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { Text } from '@/components/quiet/Text';
import { fonts, q } from '@/theme';

export type IconName = ComponentProps<typeof Feather>['name'];

/** Pull-to-refresh spinner in the accent colour. */
export function quietRefresh(refreshing: boolean, onRefresh: () => void) {
  return <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[ q.accent ]} progressBackgroundColor={q.raised} tintColor={q.accent} />;
}

/** Rounded primary or outlined button, like the web's pills. */
export function Pill({ label, onPress, variant = 'primary', icon, disabled, style }: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost';
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pill,
        primary ? styles.pillPrimary : styles.pillGhost,
        { opacity: disabled ? 0.5 : 1, transform: [ { scale: pressed ? 0.97 : 1 } ] },
        style,
      ]}
    >
      <Text size={15} weight={primary ? 'medium' : 'regular'} color={primary ? q.bg : q.text}>{label}</Text>
      {icon ? <Feather name={icon} size={15} color={primary ? q.bg : q.text} /> : null}
    </Pressable>
  );
}

/** Square 44pt icon button. */
export function IconButton({ icon, label, onPress, color = q.muted, size = 20 }: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  color?: string;
  size?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [ styles.iconButton, { opacity: pressed ? 0.6 : 1 } ]}
    >
      <Feather name={icon} size={size} color={color} />
    </Pressable>
  );
}

/** Text with a dashed underline that opens a picker — the web's game selector. */
export function DashedSelect({ label, onPress, size = 17, color = q.accent, accessibilityLabel }: {
  label: string;
  onPress: () => void;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [ styles.dashed, { borderBottomColor: color, opacity: pressed ? 0.7 : 1 } ]}
    >
      <Text size={size} weight="light" color={color}>{label}</Text>
      <Feather name="chevron-down" size={Math.round(size * 0.75)} color={color} />
    </Pressable>
  );
}

/** Full-width list row with a hairline on top. */
export function Row({ children, onPress, style, accessibilityLabel }: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  if (!onPress) {
    return <View style={[ styles.row, style ]}>{children}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [ styles.row, pressed && styles.rowPressed, style ]}
    >
      {children}
    </Pressable>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <Text size={13} color={q.muted}>{children}</Text>
      {right}
    </View>
  );
}

/** Round avatar that falls back to the name's first letter. */
export function Avatar({ uri, name, size = 40 }: { uri?: string | null; name: string; size?: number }) {
  return (
    <View style={[ styles.avatar, { width: size, height: size, borderRadius: size / 2 } ]}>
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      ) : (
        <Text size={size * 0.38} weight="light" color={q.soft}>{name.charAt(0).toUpperCase()}</Text>
      )}
    </View>
  );
}

/** Small toggle chip, outlined until it's on. */
export function ToggleChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [ styles.chip, { borderColor: selected ? q.accent : q.line3, opacity: pressed ? 0.7 : 1 } ]}
    >
      <Text size={13} color={selected ? q.accent : q.muted}>{label}</Text>
    </Pressable>
  );
}

/** Placeholder block that breathes while content loads. */
export function Skeleton({ width, height, radius = 4, style }: {
  width?: ViewStyle['width'];
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (!reduceMotion) {
      opacity.value = withRepeat(withTiming(0.45, { duration: 900 }), -1, true);
    }
  }, [ opacity, reduceMotion ]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[ { width, height, borderRadius: radius, backgroundColor: q.raised }, animated, style ]} />;
}

/** Underlined text input; `icon` adds a leading search glass. */
export const UnderlineInput = forwardRef<TextInput, TextInputProps & { icon?: IconName; size?: number; invalid?: boolean }>(
  ({ icon, size = 15, invalid, style, ...rest }, ref) => (
    <View style={[ styles.input, { borderBottomColor: invalid ? '#6B3329' : q.line3 } ]}>
      {icon ? <Feather name={icon} size={15} color={q.dim} /> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={q.faint}
        selectionColor={q.accent}
        cursorColor={q.accent}
        autoCorrect={false}
        autoCapitalize="none"
        {...rest}
        style={[ styles.inputText, { fontSize: size, fontFamily: size > 18 ? fonts.light : fonts.regular }, style ]}
      />
    </View>
  ),
);
UnderlineInput.displayName = 'UnderlineInput';

const styles = StyleSheet.create({
  pill: {
    height: 48,
    paddingHorizontal: 22,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pillPrimary: {
    backgroundColor: q.text,
  },
  pillGhost: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: q.line3,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    paddingBottom: 2,
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: q.line,
  },
  rowPressed: {
    backgroundColor: '#121214',
  },
  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
  },
  avatar: {
    backgroundColor: q.line3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
  },
  inputText: {
    flex: 1,
    color: q.white,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
});
