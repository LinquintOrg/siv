import { FlashList } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, IconButton, Searchbar, Snackbar, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { MUSIC_URL, api } from '@/api/client';
import { useMusicKits } from '@/api/queries';
import type { MusicKit } from '@/api/types';
import { ErrorView, LoadingView, MessageView } from '@/components/StateViews';
import { useFormatPrice } from '@/utils/currency';

const AUDIO_FILE = /\.(mp3|ogg|wav|m4a)$/i;

/** Prefer the MVP anthem, which is the most recognisable track of a kit. */
function pickPreviewFile(files: string[]) {
  const audio = files.filter(f => AUDIO_FILE.test(f));
  return audio.find(f => /mvp/i.test(f)) ?? audio[0];
}

export default function MusicKitsScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const kits = useMusicKits();
  const formatPrice = useFormatPrice();
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const [ query, setQuery ] = useState('');
  const [ current, setCurrent ] = useState<number | null>(null);
  const [ loadingId, setLoadingId ] = useState<number | null>(null);
  const [ error, setError ] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (kits.data ?? [])
      .filter(kit => !q || kit.artist.toLowerCase().includes(q) || kit.title.toLowerCase().includes(q))
      .sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title));
  }, [ kits.data, query ]);

  const togglePlay = async (kit: MusicKit) => {
    if (current === kit.id) {
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
      setCurrent(kit.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not play this kit.');
    } finally {
      setLoadingId(null);
    }
  };

  const renderKit = ({ item }: { item: MusicKit }) => {
    const isCurrent = current === item.id;
    const isPlaying = isCurrent && status.playing;
    return (
      <TouchableRipple onPress={() => togglePlay(item)}>
        <View style={styles.row}>
          <Image source={item.image ? { uri: item.image } : null} style={[ styles.art, { backgroundColor: theme.colors.surfaceVariant } ]} contentFit="cover" />
          <View style={styles.body}>
            <Text variant="bodyLarge" numberOfLines={1} style={isCurrent ? { color: theme.colors.primary } : undefined}>{item.title}</Text>
            <Text variant="bodyMedium" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>{item.artist}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {`${formatPrice(item.price.normal)} · StatTrak™ ${formatPrice(item.price.stattrak)}`}
            </Text>
          </View>
          {loadingId === item.id ? <ActivityIndicator style={styles.spinner} /> : (
            <IconButton
              icon={isPlaying ? 'pause-circle' : 'play-circle-outline'}
              iconColor={isCurrent ? theme.colors.primary : undefined}
              size={32}
              onPress={() => togglePlay(item)}
              accessibilityLabel={isPlaying ? `Pause ${item.title}` : `Play ${item.title}`}
            />
          )}
        </View>
      </TouchableRipple>
    );
  };

  return (
    <View style={[ styles.flex, { backgroundColor: theme.colors.background } ]}>
      <Appbar.Header>
        <Appbar.Content title="Music kits" />
      </Appbar.Header>
      <View style={styles.search}>
        <Searchbar placeholder="Search artist or kit" value={query} onChangeText={setQuery} autoCorrect={false} />
      </View>

      {kits.isPending ? <LoadingView /> : kits.isError ? <ErrorView error={kits.error} onRetry={kits.refetch} /> : (
        <FlashList
          data={filtered}
          keyExtractor={kit => String(kit.id)}
          renderItem={renderKit}
          extraData={{ current, loadingId, playing: status.playing }}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={kits.isRefetching} onRefresh={kits.refetch} />}
          ListEmptyComponent={<MessageView icon="music-note-off-outline" title="No music kits found" />}
        />
      )}

      <Snackbar visible={!!error} onDismiss={() => setError(null)} duration={4000}>{error}</Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  search: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 8,
  },
  art: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  body: {
    flex: 1,
    gap: 1,
  },
  spinner: {
    width: 56,
  },
});
