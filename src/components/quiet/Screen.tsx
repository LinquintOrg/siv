import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/quiet/Controls';
import { NowPlayingBar } from '@/components/MusicPlayer';
import { GUTTER, q } from '@/theme';

/** Root of a tab: safe area on top and the now-playing bar at the bottom. */
export function TabScreen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[ styles.screen, { paddingTop: insets.top } ]}>
      <View style={styles.flex}>{children}</View>
      <NowPlayingBar />
    </View>
  );
}

/** Root of a pushed screen: safe area on top, a back button and optional actions. */
export function StackScreen({ children, center, right }: { children: ReactNode; center?: ReactNode; right?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[ styles.screen, { paddingTop: insets.top } ]}>
      <View style={styles.bar}>
        <IconButton icon="chevron-left" label="Back" size={22} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        <View style={styles.center}>{center}</View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      <View style={styles.flex}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: q.bg,
  },
  flex: {
    flex: 1,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: GUTTER - 12,
    gap: 4,
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
