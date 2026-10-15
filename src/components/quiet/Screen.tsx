import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets, type EdgeInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/quiet/Controls';
import { NowPlayingBar } from '@/components/MusicPlayer';
import { GUTTER, MAX_CONTENT_WIDTH, makeStyles } from '@/theme';

/** Width of the content column: the window less the side insets, capped on wide screens. */
export function useContentWidth() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return Math.min(width - insets.left - insets.right, MAX_CONTENT_WIDTH);
}

// In landscape the navigation bar and the camera cutout can be at the sides
const sides = (insets: EdgeInsets) => ({ paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right });

/** Root of a tab: safe area on top and the now-playing bar at the bottom. */
export function TabScreen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  return (
    <View style={[ styles.screen, sides(insets) ]}>
      <View style={styles.column}>
        <View style={styles.flex}>{children}</View>
        <NowPlayingBar />
      </View>
    </View>
  );
}

/** Root of a pushed screen: safe area on top, a back button and optional actions. */
export function StackScreen({ children, center, right }: { children: ReactNode; center?: ReactNode; right?: ReactNode }) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  return (
    <View style={[ styles.screen, sides(insets) ]}>
      <View style={styles.column}>
        <View style={styles.bar}>
          <IconButton icon="chevron-left" label="Back" size={22} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
          <View style={styles.center}>{center}</View>
          {right ? <View style={styles.right}>{right}</View> : null}
        </View>
        <View style={styles.flex}>{children}</View>
      </View>
    </View>
  );
}

const useStyles = makeStyles(q => ({
  screen: {
    flex: 1,
    backgroundColor: q.bg,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
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
}));
