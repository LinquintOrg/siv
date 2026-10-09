import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInventory, useInventoryGames, useProfile } from '@/api/queries';
import type { InventoryHistoryEntry, InventoryItem } from '@/api/types';
import { CountingValue } from '@/components/inventory/CountingValue';
import { HistoryChart } from '@/components/inventory/HistoryChart';
import { ItemCard } from '@/components/inventory/ItemCard';
import { Avatar, DashedSelect, IconButton, Pill, Skeleton, ToggleChip, UnderlineInput } from '@/components/quiet/Controls';
import { StackScreen } from '@/components/quiet/Screen';
import { ScrollTopButton, useScrollTop } from '@/components/quiet/ScrollTop';
import { OptionSheet } from '@/components/quiet/Sheet';
import { Text } from '@/components/quiet/Text';
import { ErrorView } from '@/components/StateViews';
import { SORTS, useInventoryView, visibleItems, type SortKey } from '@/stores/inventoryView';
import { GUTTER, q } from '@/theme';
import { useFormatPrice } from '@/utils/currency';
import { itemKey, itemPrice, percentChange } from '@/utils/steam';

export default function InventoryScreen() {
  const { steamid, appid } = useLocalSearchParams<{ steamid: string; appid: string }>();
  const inventory = useInventory(steamid, +appid);
  const games = useInventoryGames();
  const profile = useProfile(steamid);
  const formatPrice = useFormatPrice();
  const view = useInventoryView();
  const [ sheet, setSheet ] = useState<'game' | 'sort' | null>(null);
  const insets = useSafeAreaInsets();
  const list = useRef<FlashListRef<InventoryItem>>(null);
  const scrollTop = useScrollTop(list);

  // A different inventory starts unfiltered
  const resetView = useInventoryView(state => state.reset);
  useEffect(() => {
    resetView();
  }, [ steamid, appid, resetView ]);

  const gameName = games.data?.find(g => g.appid === +appid)?.name ?? 'Game';
  const all = inventory.data?.items;
  const items = useMemo(() => visibleItems(all ?? [], view), [ all, view ]);

  const openItem = useCallback((item: InventoryItem) => {
    router.push({ pathname: '/profile/[steamid]/[appid]/item', params: { steamid, appid, key: itemKey(item) } });
  }, [ steamid, appid ]);

  const name = profile.data?.personaname ?? '';
  const center = name ? (
    <>
      <Avatar uri={profile.data?.avatar} name={name} size={28} />
      <Text size={15} numberOfLines={1} style={styles.flex}>{name}</Text>
    </>
  ) : null;

  const gamePicker = (
    <View style={styles.gameLine}>
      <DashedSelect label={gameName} onPress={() => setSheet('game')} accessibilityLabel={`Game: ${gameName}. Change game`} />
      <Text size={17} weight="light" color={q.muted}>inventory value</Text>
    </View>
  );

  const sheets = (
    <>
      <OptionSheet
        open={sheet === 'game'}
        onClose={() => setSheet(null)}
        kicker={name ? `${name}'s inventories` : undefined}
        title="Game"
        options={(games.data ?? []).map(g => ({ value: String(g.appid), label: g.name, image: g.icon }))}
        selected={appid}
        onSelect={value => {
          setSheet(null);
          if (value !== appid) {
            router.setParams({ appid: value });
          }
        }}
      />
      <OptionSheet
        open={sheet === 'sort'}
        onClose={() => setSheet(null)}
        kicker={gameName}
        title="Sort items"
        options={(Object.keys(SORTS) as SortKey[]).map(key => ({ value: key, label: SORTS[key] }))}
        selected={view.sort}
        onSelect={value => {
          view.setSort(value);
          setSheet(null);
        }}
      />
    </>
  );

  const right = <IconButton icon="sliders" label="Sort items" onPress={() => setSheet('sort')} />;

  if (inventory.isPending) {
    return (
      <StackScreen center={center} right={right}>
        <View style={styles.pad}>
          {gamePicker}
          <InventorySkeleton />
        </View>
        {sheets}
      </StackScreen>
    );
  }

  if (inventory.isError) {
    return (
      <StackScreen center={center}>
        <View style={styles.pad}>{gamePicker}</View>
        <ErrorView title={`Couldn't load the ${gameName} inventory`} error={inventory.error} onRetry={inventory.refetch} />
        {sheets}
      </StackScreen>
    );
  }

  const data = inventory.data;
  const isEmpty = data.items.length === 0;

  const header = (
    <View style={styles.headerPad}>
      {gamePicker}
      {isEmpty ? (
        <View style={styles.empty}>
          <Text size={40} weight="extralight" tracking={-0.045} color={q.faint}>{formatPrice(0)}</Text>
          <Text size={15} color={q.muted} leading={1.6}>No items here. This {gameName} inventory is empty, or it&apos;s private.</Text>
          <Pill label="Try another game" variant="ghost" onPress={() => setSheet('game')} style={styles.emptyAction} />
        </View>
      ) : (
        <>
          <Summary items={data.items} history={data.history} rank={data.rank} appid={appid} formatPrice={formatPrice} />
          <View style={styles.toolbar}>
            <View style={styles.toolbarTop}>
              <Text size={14} color={q.muted}>
                Items <Text size={14} tabular>{items.length === data.items.length ? data.items.length : `${items.length} of ${data.items.length}`}</Text>
              </Text>
              <Pressable
                onPress={() => setSheet('sort')}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`Sort: ${SORTS[view.sort]}`}
                style={styles.sortButton}
              >
                <Text size={13} color={q.dim}>Sort </Text>
                <Text size={13} style={styles.sortValue}>{SORTS[view.sort]}</Text>
              </Pressable>
            </View>
            <UnderlineInput
              icon="search"
              value={view.query}
              onChangeText={view.setQuery}
              placeholder="Filter by name or type"
              accessibilityLabel="Filter items"
            />
            <View style={styles.chips}>
              <ToggleChip label="With price" selected={view.pricedOnly} onPress={view.togglePriced} />
              <ToggleChip label="Tradable" selected={view.tradableOnly} onPress={view.toggleTradable} />
            </View>
          </View>
          {items.length === 0 ? <Text size={15} color={q.dim} align="center" style={styles.noMatch}>Nothing matches that filter.</Text> : null}
        </>
      )}
    </View>
  );

  return (
    <StackScreen center={center} right={isEmpty ? undefined : right}>
      <FlashList
        ref={list}
        data={isEmpty ? [] : items}
        numColumns={2}
        keyExtractor={itemKey}
        renderItem={({ item, index }) => <ItemCard item={item} index={index} formatPrice={formatPrice} onPress={openItem} />}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        onScroll={scrollTop.onScroll}
      />
      {/* Pushed screens run under the system navigation bar */}
      <ScrollTopButton visible={scrollTop.visible} onPress={scrollTop.scrollToTop} bottom={insets.bottom} />
      {sheets}
    </StackScreen>
  );
}

function Summary({ items, history, rank, appid, formatPrice }: {
  items: InventoryItem[];
  history: InventoryHistoryEntry[];
  rank: number | null;
  appid: string;
  formatPrice: (usd: number | null | undefined) => string;
}) {
  const total = items.reduce((sum, item) => sum + (itemPrice(item) ?? 0) * item.amount, 0);
  const count = items.reduce((sum, item) => sum + item.amount, 0);
  const mostValuable = Math.max(0, ...items.map(item => itemPrice(item) ?? 0));
  // History is newest first and already includes the current lookup
  const oldest = history.length > 1 ? history[history.length - 1] : null;
  const change = oldest ? total - oldest.inventoryValue : null;
  const changePct = oldest ? percentChange(oldest.inventoryValue, total) : null;
  const since = oldest ? new Date(oldest.searchedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  const stats: { label: string; value: string; color?: string }[] = [
    { label: 'Items', value: count.toLocaleString('en-US') },
    { label: 'Unique', value: items.length.toLocaleString('en-US') },
    { label: 'Most valuable', value: formatPrice(mostValuable) },
    changePct !== null
      ? { label: `Since ${since}`, value: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(1)}%`, color: changePct >= 0 ? q.accent : q.danger }
      : { label: 'Rank', value: rank ? `#${rank.toLocaleString('en-US')}` : '—' },
  ];

  return (
    <View>
      <View style={styles.value}>
        <CountingValue value={total} format={formatPrice} />
        <Animated.View entering={FadeIn.duration(500).delay(300)} style={styles.changeLine}>
          {change !== null ? (
            <Text size={14} color={q.muted}>
              {change >= 0 ? 'Up ' : 'Down '}
              <Text size={14} color={change >= 0 ? q.accent : q.danger}>{formatPrice(Math.abs(change))}</Text>
              {` since ${since}`}
            </Text>
          ) : null}
          {change !== null && rank ? <Text size={14} color={q.muted}>·</Text> : null}
          {rank ? (
            <Pressable onPress={() => router.navigate({ pathname: '/leaderboard', params: { appid } })} hitSlop={8} accessibilityRole="link">
              <Text size={14} color={q.muted} style={styles.underline}>#{rank.toLocaleString('en-US')} on the leaderboard</Text>
            </Pressable>
          ) : null}
        </Animated.View>
      </View>

      <Animated.View entering={FadeIn.duration(500).delay(150)} style={styles.chart}>
        <HistoryChart history={history} formatPrice={formatPrice} />
      </Animated.View>

      <Animated.View entering={FadeIn.duration(500).delay(200)} style={styles.stats}>
        {stats.map(stat => (
          <View key={stat.label} style={styles.stat}>
            <Text size={12} color={q.dim}>{stat.label}</Text>
            <Text size={24} weight="light" tracking={-0.02} tabular color={stat.color ?? q.text} numberOfLines={1} adjustsFontSizeToFit>{stat.value}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

function InventorySkeleton() {
  return (
    <View style={styles.skeleton} accessibilityLabel="Loading inventory">
      <Skeleton width="78%" height={52} radius={12} />
      <Skeleton width="60%" height={12} />
      <Skeleton height={128} radius={14} style={styles.skeletonChart} />
      <View style={styles.stats}>
        {[ 0, 1, 2, 3 ].map(i => (
          <View key={i} style={[ styles.stat, styles.skeletonStat ]}>
            <Skeleton width={48} height={10} />
            <Skeleton width={84} height={22} />
          </View>
        ))}
      </View>
      <View style={styles.skeletonGrid}>
        {[ 0, 1, 2, 3 ].map(i => (
          <View key={i} style={styles.skeletonCard}>
            <Skeleton height={150} radius={18} />
            <Skeleton width="80%" height={12} />
            <Skeleton width="50%" height={10} />
            <Skeleton width="36%" height={12} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  pad: {
    paddingHorizontal: GUTTER,
    paddingTop: 12,
  },
  list: {
    paddingHorizontal: GUTTER - 7,
    paddingBottom: 40,
  },
  headerPad: {
    paddingHorizontal: 7,
    paddingTop: 12,
  },
  gameLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 8,
  },
  value: {
    marginTop: 12,
    gap: 10,
  },
  changeLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  underline: {
    textDecorationLine: 'underline',
    textDecorationColor: q.line3,
  },
  chart: {
    marginTop: 28,
  },
  stats: {
    marginTop: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 22,
  },
  stat: {
    width: '50%',
    gap: 4,
    paddingRight: 12,
  },
  toolbar: {
    marginTop: 44,
    gap: 14,
  },
  toolbarTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  sortValue: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderBottomColor: q.faint,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 26,
  },
  noMatch: {
    paddingVertical: 40,
  },
  empty: {
    paddingTop: 40,
    gap: 12,
  },
  emptyAction: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  skeleton: {
    marginTop: 16,
    gap: 14,
  },
  skeletonChart: {
    marginTop: 18,
  },
  skeletonStat: {
    gap: 8,
  },
  skeletonGrid: {
    marginTop: 34,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 28,
    columnGap: 14,
  },
  skeletonCard: {
    width: '47%',
    gap: 10,
  },
});
