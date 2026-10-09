import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useInventoryGames, useLeaderboard } from '@/api/queries';
import type { LeaderboardEntry } from '@/api/types';
import { Avatar, DashedSelect, Row, Skeleton, UnderlineInput, quietRefresh } from '@/components/quiet/Controls';
import { TabScreen } from '@/components/quiet/Screen';
import { ScrollTopButton, useScrollTop } from '@/components/quiet/ScrollTop';
import { OptionSheet } from '@/components/quiet/Sheet';
import { Text } from '@/components/quiet/Text';
import { ErrorView } from '@/components/StateViews';
import { GUTTER, q } from '@/theme';
import { useFormatPrice } from '@/utils/currency';

function useDebounced<T>(value: T, delay = 350) {
  const [ debounced, setDebounced ] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [ value, delay ]);
  return debounced;
}

export default function LeaderboardScreen() {
  const params = useLocalSearchParams<{ appid?: string }>();
  const formatPrice = useFormatPrice();
  const games = useInventoryGames();
  const [ appid, setAppid ] = useState<number | undefined>(params.appid ? +params.appid : 730);
  const [ query, setQuery ] = useState('');
  const [ picking, setPicking ] = useState(false);
  const list = useRef<FlashListRef<LeaderboardEntry>>(null);
  const scrollTop = useScrollTop(list);
  const search = useDebounced(query.trim());
  const leaderboard = useLeaderboard({ appid, search: search || undefined });
  const entries = leaderboard.data?.pages.flatMap(p => p.entries) ?? [];
  const gameName = appid === undefined ? 'All games' : games.data?.find(g => g.appid === appid)?.name ?? 'Counter-Strike 2';

  // Opened from an inventory's rank link: follow the game it passes in
  const [ seenParam, setSeenParam ] = useState(params.appid);
  if (params.appid !== seenParam) {
    setSeenParam(params.appid);
    if (params.appid) {
      setAppid(+params.appid);
    }
  }

  const renderEntry = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    // Positions within search results aren't global ranks
    const top = !search && index < 3;
    return (
      <Animated.View entering={index < 14 ? FadeInDown.duration(400).delay(index * 30) : undefined}>
        <Row
          accessibilityLabel={`${search ? '' : `Rank ${index + 1}, `}${item.username}, ${formatPrice(item.inventory_value)}`}
          onPress={() => router.push({ pathname: '/profile/[steamid]', params: { steamid: item.steamid } })}
        >
          <Text size={12} mono tabular color={top ? q.accent : q.faint} style={styles.rank}>{search ? '' : String(index + 1).padStart(2, '0')}</Text>
          <Avatar uri={item.avatar_url} name={item.username} size={38} />
          <View style={styles.body}>
            <Text size={15} numberOfLines={1}>{item.username}</Text>
            <Text size={12} color={q.dim} numberOfLines={1}>
              {appid === undefined ? `${item.game_title} · ` : ''}{`${item.item_count.toLocaleString('en-US')} items`}
            </Text>
          </View>
          <Text size={top ? 17 : 15} tabular>{formatPrice(item.inventory_value)}</Text>
        </Row>
      </Animated.View>
    );
  };

  const header = (
    <Animated.View entering={FadeInDown.duration(450)} style={styles.header}>
      <Text size={44} weight="extralight" tracking={-0.045}>Leaderboard</Text>
      <View style={styles.sentence}>
        <Text size={15} color={q.muted}>The most valuable inventories in</Text>
        <DashedSelect label={gameName} size={15} onPress={() => setPicking(true)} accessibilityLabel={`Game: ${gameName}. Change game`} />
      </View>
      <UnderlineInput icon="search" value={query} onChangeText={setQuery} placeholder="Find a player" accessibilityLabel="Find a player" />
    </Animated.View>
  );

  const skeletonRows = (count: number) => Array.from({ length: count }, (_, i) => (
    <Row key={i}>
      <Skeleton width={18} height={10} />
      <Skeleton width={38} height={38} radius={19} />
      <View style={styles.body}>
        <Skeleton width="46%" height={12} />
        <Skeleton width="64%" height={10} />
      </View>
      <Skeleton width={76} height={14} />
    </Row>
  ));

  return (
    <TabScreen>
      {leaderboard.isError ? (
        <>
          <View style={styles.pad}>{header}</View>
          <ErrorView title="Couldn't load the leaderboard" error={leaderboard.error} onRetry={leaderboard.refetch} />
        </>
      ) : (
        <FlashList
          ref={list}
          data={leaderboard.isPending ? [] : entries}
          keyExtractor={item => String(item.id)}
          renderItem={renderEntry}
          ListHeaderComponent={header}
          contentContainerStyle={styles.pad}
          keyboardShouldPersistTaps="handled"
          onScroll={scrollTop.onScroll}
          onEndReached={() => {
            if (leaderboard.hasNextPage && !leaderboard.isFetchingNextPage) {
              leaderboard.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={quietRefresh(leaderboard.isRefetching && !leaderboard.isFetchingNextPage, leaderboard.refetch)}
          ListEmptyComponent={leaderboard.isPending
            ? <View>{skeletonRows(8)}</View>
            : <Text size={15} color={q.dim} align="center" style={styles.empty}>{search ? `No players match “${search}”.` : 'No players yet.'}</Text>}
          ListFooterComponent={leaderboard.isFetchingNextPage
            ? <View>{skeletonRows(3)}</View>
            : entries.length > 0 && !leaderboard.hasNextPage
              ? <Text size={12} color={q.faint} align="center" style={styles.end}>That&apos;s everyone for now.</Text>
              : null}
        />
      )}
      <ScrollTopButton visible={scrollTop.visible && !leaderboard.isError} onPress={scrollTop.scrollToTop} />
      <OptionSheet
        open={picking}
        onClose={() => setPicking(false)}
        kicker="Most valuable in"
        title="Leaderboard"
        options={[ { value: 0, label: 'All games' }, ...(games.data ?? []).map(g => ({ value: g.appid, label: g.name, image: g.icon })) ]}
        selected={appid ?? 0}
        onSelect={value => {
          setAppid(value === 0 ? undefined : value);
          setPicking(false);
        }}
      />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: GUTTER,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 28,
    paddingBottom: 22,
    gap: 16,
  },
  sentence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    columnGap: 6,
    rowGap: 4,
  },
  rank: {
    width: 22,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  empty: {
    paddingVertical: 40,
  },
  end: {
    paddingTop: 24,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: q.line,
  },
});
