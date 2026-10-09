import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { Text } from '@/components/quiet/Text';
import { q } from '@/theme';

interface Toast {
  id: number;
  message: string;
  action?: { label: string; onPress: () => void };
}

interface ToastState {
  toast: Toast | null;
  show: (message: string, action?: Toast['action']) => void;
  dismiss: () => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useToast = create<ToastState>()(set => ({
  toast: null,
  show: (message, action) => {
    clearTimeout(timer);
    set({ toast: { id: Date.now(), message, action } });
    timer = setTimeout(() => set({ toast: null }), action ? 4500 : 3000);
  },
  dismiss: () => {
    clearTimeout(timer);
    set({ toast: null });
  },
}));

/** Sits above everything; screens call useToast().show(). */
export function Toaster() {
  const toast = useToast(state => state.toast);
  const dismiss = useToast(state => state.dismiss);
  const insets = useSafeAreaInsets();

  if (!toast) {
    return null;
  }
  return (
    <View pointerEvents="box-none" style={[ styles.wrap, { bottom: insets.bottom + 96 } ]}>
      <Animated.View key={toast.id} entering={FadeInDown.duration(300)} exiting={FadeOut.duration(150)} style={styles.toast} accessibilityLiveRegion="polite">
        <Text size={14} style={styles.message}>{toast.message}</Text>
        {toast.action ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            style={styles.action}
            onPress={() => {
              toast.action?.onPress();
              dismiss();
            }}
          >
            <Text size={14} color={q.accent}>{toast.action.label}</Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 14,
    right: 14,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 50,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#161618',
    borderWidth: 1,
    borderColor: q.line3,
  },
  message: {
    flex: 1,
  },
  action: {
    height: 36,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
});
