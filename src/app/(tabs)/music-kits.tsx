import { Feather } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useMusicKits } from '@/api/queries';
import type { MusicKit } from '@/api/types';
import { Equalizer, useMusicPlayer } from '@/components/MusicPlayer';
import { Row, Skeleton, UnderlineInput, quietRefresh } from '@/components/quiet/Controls';
import { TabScreen } from '@/components/quiet/Screen';
import { Text } from '@/components/quiet/Text';
import { ErrorView } from '@/components/StateViews';
import { GUTTER, q } from '@/theme';
import { useFormatPrice } from '@/utils/currency';

export default function MusicKitsScreen() {
  const kits = useMusicKits();
  const formatPrice = useFormatPrice();
  const { current, playing, loadingId, toggle } = useMusicPlayer();
  const [ query, setQuery ] = useState('');

  const filtered = useMemo(() => {
    const q2 = query.trim().toLowerCase();
    return (kits.data ?? [])
      .filter(kit => !q2 || kit.artist.toLowerCase().includes(q2) || kit.title.toLowerCase().includes(q2))
      .sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title));
  }, [ kits.data, query ]);

  const renderKit = ({ item, index }: { item: MusicKit; index: number }) => {
    const isCurrent = current?.id === item.id;
    const isPlaying = isCurrent && playing;
    const isLoading = loadingId === item.id;
    return (
      <Animated.View entering={index < 12 ? FadeInDown.duration(400).delay(index * 30) : undefined}>
        <Row style={styles.row} onPress={() => toggle(item)} accessibilityLabel={`${item.title} by ${item.artist}`}>
          <View style={styles.art}>
            {item.image ? <Image source={{ uri: item.image }} style={[ StyleSheet.absoluteFill, isCurrent && styles.artDim ]} contentFit="cover" /> : null}
            {isCurrent ? <Equalizer playing={isPlaying} /> : null}
          </View>
          <View style={styles.body}>
            <Text size={15} numberOfLines={1} color={isCurrent ? q.accent : q.text}>{item.title}</Text>
            <Text size={13} color={q.muted} numberOfLines={1}>{item.artist}</Text>
            <Text size={12} color={q.dim} tabular>{`${formatPrice(item.price.normal)} · StatTrak™ ${formatPrice(item.price.stattrak)}`}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? `Pause ${item.title}` : `Play ${item.title}`}
            onPress={() => toggle(item)}
            style={[ styles.play, { borderColor: isCurrent ? q.accent : q.line3 } ]}
          >
            {isLoading
              ? <ActivityIndicator size="small" color={q.accent} />
              : <Feather name={isPlaying ? 'pause' : 'play'} size={16} color={isCurrent ? q.accent : q.soft} style={isPlaying ? undefined : styles.playIcon} />}
          </Pressable>
        </Row>
      </Animated.View>
    );
  };

  const header = (
    <Animated.View entering={FadeInDown.duration(450)} style={styles.header}>
      <Text size={44} weight="extralight" tracking={-0.045}>Music kits</Text>
      <Text size={15} color={q.muted} leading={1.6}>Hear every Counter-Strike 2 kit before you buy it.</Text>
      <UnderlineInput icon="search" value={query} onChangeText={setQuery} placeholder="Search artist or kit" accessibilityLabel="Search music kits" />
    </Animated.View>
  );

  return (
    <TabScreen>
      {kits.isError ? (
        <>
          <View style={styles.pad}>{header}</View>
          <ErrorView title="Couldn't load music kits" error={kits.error} onRetry={kits.refetch} />
        </>
      ) : (
        <FlashList
          data={kits.isPending ? [] : filtered}
          keyExtractor={kit => String(kit.id)}
          renderItem={renderKit}
          extraData={{ current, playing, loadingId }}
          ListHeaderComponent={header}
          contentContainerStyle={styles.pad}
          keyboardShouldPersistTaps="handled"
          refreshControl={quietRefresh(kits.isRefetching, kits.refetch)}
          ListEmptyComponent={kits.isPending ? (
            <View>
              {Array.from({ length: 7 }, (_, i) => (
                <Row key={i} style={styles.row}>
                  <Skeleton width={52} height={52} radius={12} />
                  <View style={styles.body}>
                    <Skeleton width="55%" height={12} />
                    <Skeleton width="35%" height={10} />
                    <Skeleton width="60%" height={10} />
                  </View>
                  <Skeleton width={44} height={44} radius={22} />
                </Row>
              ))}
            </View>
          ) : <Text size={15} color={q.dim} align="center" style={styles.empty}>No kits match “{query.trim()}”.</Text>}
        />
      )}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: GUTTER,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 22,
    gap: 16,
  },
  row: {
    minHeight: 72,
  },
  art: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: q.hover,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artDim: {
    opacity: 0.25,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  play: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    marginLeft: 2,
  },
  empty: {
    paddingVertical: 40,
  },
});
