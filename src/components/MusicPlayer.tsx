import { useQueryClient } from '@tanstack/react-query';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { MUSIC_URL, api } from '@/api/client';
import type { MusicKit } from '@/api/types';
import { IconButton } from '@/components/quiet/Controls';
import { Text } from '@/components/quiet/Text';
import { useToast } from '@/components/quiet/Toaster';
import { GUTTER, q } from '@/theme';

const AUDIO_FILE = /\.(mp3|ogg|wav|m4a)$/i;

/** Prefer the MVP anthem, which is the most recognisable track of a kit. */
function pickPreviewFile(files: string[]) {
  const audio = files.filter(f => AUDIO_FILE.test(f));
  return audio.find(f => /mvp/i.test(f)) ?? audio[0];
}

interface PlayerState {
  current: MusicKit | null;
  playing: boolean;
  loadingId: number | null;
  toggle: (kit: MusicKit) => void;
  stop: () => void;
}

const PlayerContext = createContext<PlayerState | null>(null);
// Progress ticks several times a second, so it has its own context to keep lists from re-rendering
const ProgressContext = createContext(0);

export function useMusicPlayer() {
  const value = useContext(PlayerContext);
  if (!value) {
    throw new Error('useMusicPlayer must be used inside MusicPlayerProvider');
  }
  return value;
}

/** Owns the one audio player so a preview keeps playing while you move between tabs. */
export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const showToast = useToast(state => state.show);
  const [ current, setCurrent ] = useState<MusicKit | null>(null);
  const [ loadingId, setLoadingId ] = useState<number | null>(null);

  const toggle = async (kit: MusicKit) => {
    if (current?.id === kit.id) {
      if (status.playing) {
        player.pause();
      } else {
        if (status.currentTime >= status.duration - 0.1) {
          await player.seekTo(0);
        }
        player.play();
      }
      return;
    }

    setLoadingId(kit.id);
    try {
      const files = await queryClient.fetchQuery({
        queryKey: [ 'musicKitFiles', kit.id ],
        queryFn: () => api.musicKitFiles(kit.id),
        staleTime: Infinity,
      });
      const file = pickPreviewFile(files);
      if (!file) {
        throw new Error('No preview available for this kit.');
      }
      player.replace({ uri: `${MUSIC_URL}/${encodeURIComponent(kit.folder)}/${encodeURIComponent(file)}`, name: `${kit.artist} – ${kit.title}` });
      player.play();
      setCurrent(kit);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not play this kit.');
    } finally {
      setLoadingId(null);
    }
  };

  const stop = () => {
    player.pause();
    setCurrent(null);
  };

  const value: PlayerState = {
    current,
    playing: !!current && status.playing,
    loadingId,
    toggle: kit => void toggle(kit),
    stop,
  };

  const progress = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;

  return (
    <PlayerContext.Provider value={value}>
      <ProgressContext.Provider value={progress}>{children}</ProgressContext.Provider>
    </PlayerContext.Provider>
  );
}

/** Three bars that bounce while a kit plays. */
export function Equalizer({ playing, color = q.accent }: { playing: boolean; color?: string }) {
  return (
    <View style={styles.eq} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {[ 0, 1, 2 ].map(i => <EqBar key={i} index={i} playing={playing} color={color} />)}
    </View>
  );
}

function EqBar({ index, playing, color }: { index: number; playing: boolean; color: string }) {
  const reduceMotion = useReducedMotion();
  const height = useSharedValue(6);
  useEffect(() => {
    if (playing && !reduceMotion) {
      height.value = withDelay(index * 150, withRepeat(withSequence(withTiming(16, { duration: 420 }), withTiming(4, { duration: 420 })), -1));
    } else {
      cancelAnimation(height);
    }
  }, [ playing, reduceMotion, index, height ]);
  const style = useAnimatedStyle(() => ({ height: height.value }));
  return <Animated.View style={[ styles.eqBar, { backgroundColor: color }, style ]} />;
}

/** Shown at the bottom of every tab while a preview is loaded. */
export function NowPlayingBar() {
  const { current, playing, toggle, stop } = useMusicPlayer();
  const progress = useContext(ProgressContext);
  if (!current) {
    return null;
  }
  return (
    <View style={styles.bar}>
      <View style={[ styles.progress, { width: `${progress * 100}%` } ]} />
      <Equalizer playing={playing} />
      <View style={styles.barText}>
        <Text size={14} numberOfLines={1}>{current.title}</Text>
        <Text size={12} color={q.dim} numberOfLines={1}>{current.artist}</Text>
      </View>
      <IconButton icon={playing ? 'pause' : 'play'} label={playing ? 'Pause' : 'Play'} color={q.text} size={18} onPress={() => toggle(current)} />
      <IconButton icon="x" label="Stop" color={q.dim} size={18} onPress={stop} />
    </View>
  );
}

const styles = StyleSheet.create({
  eq: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 16,
    width: 15,
  },
  eqBar: {
    width: 3,
    borderRadius: 2,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 60,
    paddingLeft: GUTTER - 4,
    paddingRight: 6,
    backgroundColor: q.sheet,
    borderTopWidth: 1,
    borderTopColor: q.line2,
  },
  progress: {
    position: 'absolute',
    top: -1,
    left: 0,
    height: 1,
    backgroundColor: q.accent,
  },
  barText: {
    flex: 1,
    gap: 1,
  },
});
