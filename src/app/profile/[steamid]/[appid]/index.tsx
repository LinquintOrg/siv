import { FlashList } from '@shopify/flash-list';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { Appbar, Card, Chip, Divider, Menu, Searchbar, Text, useTheme } from 'react-native-paper';

import { useInventory, useInventoryGames } from '@/api/queries';
import type { InventoryHistoryEntry, InventoryItem } from '@/api/types';
import { FilterChip } from '@/components/FilterChip';
import { InventoryItemRow } from '@/components/InventoryItemRow';
import { PriceChange } from '@/components/PriceChange';
import { ErrorView, LoadingView, MessageView } from '@/components/StateViews';
import { ValueChart } from '@/components/ValueChart';
import { useFormatPrice } from '@/utils/currency';
import { itemKey, itemPrice, percentChange } from '@/utils/steam';

const SORTS = {
  'total-desc': 'Total value',
  'price-desc': 'Price: high to low',
  'price-asc': 'Price: low to high',
  'amount-desc': 'Quantity',
  name: 'Name',
} as const;
type SortKey = keyof typeof SORTS;

function sortItems(items: InventoryItem[], sort: SortKey) {
  const price = (i: InventoryItem) => itemPrice(i) ?? -1;
  const sorted = [ ...items ];
  switch (sort) {
    case 'total-desc':
      return sorted.sort((a, b) => price(b) * b.amount - price(a) * a.amount);
    case 'price-desc':
      return sorted.sort((a, b) => price(b) - price(a));
    case 'price-asc':
      // Unpriced items go last
      return sorted.sort((a, b) => (itemPrice(a) ?? Infinity) - (itemPrice(b) ?? Infinity));
    case 'amount-desc':
      return sorted.sort((a, b) => b.amount - a.amount);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export default function InventoryScreen() {
  const theme = useTheme();
  const { steamid, appid } = useLocalSearchParams<{ steamid: string; appid: string }>();
  const inventory = useInventory(steamid, +appid);
  const games = useInventoryGames();
  const formatPrice = useFormatPrice();
  const [ query, setQuery ] = useState('');
  const [ sort, setSort ] = useState<SortKey>('total-desc');
  const [ sortMenuOpen, setSortMenuOpen ] = useState(false);
  const [ pricedOnly, setPricedOnly ] = useState(false);

  const gameName = games.data?.find(g => g.appid === +appid)?.name ?? 'Inventory';

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = (inventory.data?.items ?? []).filter(item =>
      (!pricedOnly || itemPrice(item) !== null)
      && (!q || item.name.toLowerCase().includes(q) || item.itemType.toLowerCase().includes(q)),
    );
    return sortItems(filtered, sort);
  }, [ inventory.data, query, sort, pricedOnly ]);

  const openItem = useCallback((item: InventoryItem) => {
    router.push({ pathname: '/profile/[steamid]/[appid]/item', params: { steamid, appid, key: itemKey(item) } });
  }, [ steamid, appid ]);

  const header = (
    <>
      <Stack.Screen
        options={{
          title: gameName,
          headerRight: () => (
            <Menu
              visible={sortMenuOpen}
              onDismiss={() => setSortMenuOpen(false)}
              anchor={<Appbar.Action icon="sort" accessibilityLabel="Sort" onPress={() => setSortMenuOpen(true)} />}
              anchorPosition="bottom"
            >
              {(Object.keys(SORTS) as SortKey[]).map(key => (
                <Menu.Item
                  key={key}
                  title={SORTS[key]}
                  leadingIcon={sort === key ? 'check' : undefined}
                  onPress={() => {
                    setSort(key);
                    setSortMenuOpen(false);
                  }}
                />
              ))}
            </Menu>
          ),
        }}
      />
    </>
  );

  if (inventory.isPending) {
    return <>{header}<LoadingView label="Loading inventory and prices…" /></>;
  }
  if (inventory.isError) {
    return (
      <>
        {header}
        <ErrorView error={inventory.error} onRetry={inventory.refetch} />
      </>
    );
  }
  if (inventory.data.items.length === 0) {
    return (
      <>
        {header}
        <MessageView icon="package-variant" title="No items" message={`This ${gameName} inventory is empty.`} />
      </>
    );
  }

  return (
    <View style={[ styles.flex, { backgroundColor: theme.colors.background } ]}>
      {header}
      <FlashList
        data={items}
        keyExtractor={itemKey}
        renderItem={({ item }) => <InventoryItemRow item={item} formatPrice={formatPrice} onPress={openItem} />}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={inventory.isRefetching} onRefresh={inventory.refetch} />}
        ListHeaderComponent={
          <View>
            <InventorySummary
              items={inventory.data.items}
              history={inventory.data.history}
              rank={inventory.data.rank}
              formatPrice={formatPrice}
            />
            <View style={styles.filters}>
              <Searchbar
                mode="bar"
                placeholder="Filter items"
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                style={styles.flex}
              />
            </View>
            <View style={styles.chips}>
              <FilterChip selected={pricedOnly} onPress={() => setPricedOnly(v => !v)}>With price</FilterChip>
              <Chip mode="outlined" icon="sort" onPress={() => setSortMenuOpen(true)}>{SORTS[sort]}</Chip>
            </View>
            <Divider />
          </View>
        }
        ListEmptyComponent={<MessageView icon="magnify" title="No matching items" />}
      />
    </View>
  );
}

interface SummaryProps {
  items: InventoryItem[];
  history: InventoryHistoryEntry[];
  rank: number | null;
  formatPrice: (usd: number | null | undefined) => string;
}

function InventorySummary({ items, history, rank, formatPrice }: SummaryProps) {
  const theme = useTheme();
  const total = items.reduce((sum, item) => sum + (itemPrice(item) ?? 0) * item.amount, 0);
  const count = items.reduce((sum, item) => sum + item.amount, 0);

  // History is newest first and already includes the current lookup
  const points = history
    .map(h => ({ x: new Date(h.searchedAt).getTime(), y: h.inventoryValue }))
    .sort((a, b) => a.x - b.x);
  const oldest = history.length > 1 ? history[history.length - 1] : null;

  return (
    <Card mode="contained" style={styles.summary}>
      <Card.Content style={styles.summaryContent}>
        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>Inventory value</Text>
        <Text variant="displaySmall">{formatPrice(total)}</Text>
        <View style={styles.stats}>
          <Stat label="Items" value={count.toLocaleString()} />
          <Stat label="Unique" value={items.length.toLocaleString()} />
          {rank !== null && <Stat label="Rank" value={`#${rank.toLocaleString()}`} />}
          {oldest && (
            <View>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Since {new Date(oldest.searchedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
              <PriceChange variant="titleMedium" percent={percentChange(oldest.inventoryValue, total)} />
            </View>
          )}
        </View>
        {points.length > 1 && <ValueChart points={points} formatValue={formatPrice} />}
      </Card.Content>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{label}</Text>
      <Text variant="titleMedium">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  summary: {
    margin: 16,
    marginBottom: 8,
  },
  summaryContent: {
    gap: 8,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginVertical: 4,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
