import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Avatar, Searchbar, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { useInventoryGames, useLeaderboard } from '@/api/queries';
import type { LeaderboardEntry } from '@/api/types';
import { FilterChip } from '@/components/FilterChip';
import { ErrorView, LoadingView, MessageView } from '@/components/StateViews';
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
  const theme = useTheme();
  const formatPrice = useFormatPrice();
  const games = useInventoryGames();
  const [ appid, setAppid ] = useState<number | undefined>(730);
  const [ query, setQuery ] = useState('');
  const search = useDebounced(query.trim());
  const leaderboard = useLeaderboard({ appid, search: search || undefined });

  const entries = leaderboard.data?.pages.flatMap(p => p.entries) ?? [];

  const renderEntry = ({ item, index }: { item: LeaderboardEntry; index: number }) => (
    <TouchableRipple onPress={() => router.push({ pathname: '/profile/[steamid]', params: { steamid: item.steamid } })}>
      <View style={styles.row}>
        <Text variant="titleMedium" style={[ styles.rank, { color: index < 3 && !search ? theme.colors.primary : theme.colors.onSurfaceVariant } ]}>
          {/* Positions within search results aren't global ranks */}
          {search ? '' : index + 1}
        </Text>
        <Avatar.Image size={40} source={{ uri: item.avatar_url }} />
        <View style={styles.body}>
          <Text variant="bodyLarge" numberOfLines={1}>{item.username}</Text>
          <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
            {appid === undefined ? `${item.game_title} · ` : ''}{`${item.item_count.toLocaleString()} items`}
          </Text>
        </View>
        <Text variant="titleSmall">{formatPrice(item.inventory_value)}</Text>
      </View>
    </TouchableRipple>
  );

  return (
    <View style={[ styles.flex, { backgroundColor: theme.colors.background } ]}>
      <Appbar.Header>
        <Appbar.Content title="Leaderboard" />
      </Appbar.Header>

      <View style={styles.search}>
        <Searchbar placeholder="Search players" value={query} onChangeText={setQuery} autoCorrect={false} autoCapitalize="none" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipsScroll}>
        <FilterChip selected={appid === undefined} onPress={() => setAppid(undefined)}>All games</FilterChip>
        {games.data?.map(game => (
          <FilterChip key={game.appid} selected={appid === game.appid} onPress={() => setAppid(game.appid)}>{game.name}</FilterChip>
        ))}
      </ScrollView>

      {leaderboard.isPending ? <LoadingView /> : leaderboard.isError ? <ErrorView error={leaderboard.error} onRetry={leaderboard.refetch} /> : (
        <FlashList
          data={entries}
          keyExtractor={item => String(item.id)}
          renderItem={renderEntry}
          onEndReached={() => {
            if (leaderboard.hasNextPage && !leaderboard.isFetchingNextPage) {
              leaderboard.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={leaderboard.isRefetching && !leaderboard.isFetchingNextPage} onRefresh={leaderboard.refetch} />}
          ListFooterComponent={leaderboard.isFetchingNextPage ? <ActivityIndicator style={styles.footer} /> : null}
          ListEmptyComponent={<MessageView icon="trophy-outline" title="No players found" />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  search: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  chipsScroll: {
    flexGrow: 0,
  },
  chips: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rank: {
    width: 32,
    textAlign: 'center',
  },
  body: {
    flex: 1,
  },
  footer: {
    padding: 16,
  },
});
