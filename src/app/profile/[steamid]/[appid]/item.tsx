import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { Easing, FadeIn, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInventory, useMarketItem } from '@/api/queries';
import type { InventoryItem, ItemHistoryRange, ItemPrice, ItemSticker } from '@/api/types';
import { FloatBar } from '@/components/inventory/FloatBar';
import { HistoryChart } from '@/components/inventory/HistoryChart';
import { RarityGlow } from '@/components/inventory/ItemCard';
import { PriceRanges } from '@/components/inventory/PriceRanges';
import { ItemImage } from '@/components/ItemImage';
import { IconButton, Pill, Row, Skeleton } from '@/components/quiet/Controls';
import { PeriodChips } from '@/components/quiet/PeriodChips';
import { StackScreen } from '@/components/quiet/Screen';
import { Text } from '@/components/quiet/Text';
import { ErrorView, MessageView } from '@/components/StateViews';
import { useInventoryView, visibleItems } from '@/stores/inventoryView';
import { GUTTER, makeStyles, useQ, type Palette } from '@/theme';
import { useFormatPrice } from '@/utils/currency';
import { itemKey, marketListingUrl, openMarketItem, percentChange, steamColor } from '@/utils/steam';

type Format = (usd: number | null | undefined) => string;

export default function ItemScreen() {
  const q = useQ();
  const styles = useStyles();
  const { steamid, appid, key } = useLocalSearchParams<{ steamid: string; appid: string; key: string }>();
  const inventory = useInventory(steamid, +appid);
  const formatPrice = useFormatPrice();
  const view = useInventoryView();
  const insets = useSafeAreaInsets();

  // Step through items in the same order as the grid behind this screen
  const all = inventory.data?.items;
  const list = useMemo(() => {
    const visible = visibleItems(all ?? [], view);
    return visible.some(i => itemKey(i) === key) ? visible : all ?? [];
  }, [ all, view, key ]);
  const index = list.findIndex(i => itemKey(i) === key);
  const item = index >= 0 ? list[index] : undefined;
  const step = (d: number) => {
    const next = list[(index + d + list.length) % list.length];
    if (next) {
      router.setParams({ key: itemKey(next) });
    }
  };

  const right = item && list.length > 1 ? (
    <>
      <IconButton icon="chevron-left" label="Previous item" size={18} onPress={() => step(-1)} />
      <Text size={11} mono color={q.dim} tabular style={styles.position}>{index + 1} / {list.length}</Text>
      <IconButton icon="chevron-right" label="Next item" size={18} onPress={() => step(1)} />
    </>
  ) : null;

  if (inventory.isPending) {
    return (
      <StackScreen>
        <View style={styles.content}>
          <Skeleton height={270} radius={24} />
          <Skeleton width="40%" height={12} style={styles.gapTop} />
          <Skeleton width="80%" height={30} radius={6} />
        </View>
      </StackScreen>
    );
  }
  if (inventory.isError) {
    return <StackScreen><ErrorView error={inventory.error} onRetry={inventory.refetch} /></StackScreen>;
  }
  if (!item) {
    return <StackScreen><MessageView title="Item not found" message="It may have left this inventory." /></StackScreen>;
  }

  const price = item.price.found ? item.price : null;

  return (
    <StackScreen right={right}>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View key={key} entering={FadeIn.duration(300)} style={styles.stack}>
          <Hero item={item} />

          <View style={styles.titleBlock}>
            <View style={styles.kicker}>
              {item.rarity?.color ? <View style={[ styles.dot, { backgroundColor: steamColor(item.rarity.color) } ]} /> : null}
              <Text size={13} color={q.muted} style={styles.flex}>{[ item.rarity?.name, item.itemType ].filter(Boolean).join(' · ')}</Text>
            </View>
            <Text size={30} weight="light" tracking={-0.03} leading={1.12}>{item.name}</Text>
            {item.marketName !== item.name ? <Text size={13} color={q.dim}>{item.marketName}</Text> : null}
            {item.phase ? (
              <View style={styles.phase}>
                <Text size={13}>{item.phase}</Text>
              </View>
            ) : null}
          </View>

          {price && item.phase ? (
            <Text size={13} color={q.dim}>Steam has one price for every phase; rarer phases sell for more.</Text>
          ) : null}

          {price ? <PriceBlock price={price} amount={item.amount} formatPrice={formatPrice} /> : (
            <Text size={15} color={q.muted} leading={1.6}>No Community Market price for this item, so it adds nothing to the inventory value.</Text>
          )}

          {item.skinProps?.float ? <FloatBar float={Number(item.skinProps.float)} condition={item.condition} range={item.floatRange} /> : null}

          {([ [ 'Stickers', item.stickers ], [ 'Patches', item.patches ], [ 'Charms', item.charms ] ] as const)
            .filter(([ , list ]) => list && list.length > 0)
            .map(([ title, list ]) => <Applied key={title} title={title} list={list ?? []} formatPrice={formatPrice} />)}

          {price ? <MarketBlocks price={price} item={item} formatPrice={formatPrice} /> : null}

          {item.marketable ? (
            <Row accessibilityLabel="Open the item's market page" onPress={() => openMarketItem(item.appid, item.marketName)}>
              <View style={styles.flex}>
                <Text size={16} weight="light">Market page</Text>
                <Text size={12} color={q.dim}>Full price history, sales and other versions</Text>
              </View>
              <Feather name="arrow-right" size={16} color={q.faint} />
            </Row>
          ) : null}

          <Details item={item} />

          {item.description ? (
            <View style={styles.block}>
              <Text size={13} color={q.muted}>Description</Text>
              <Text size={14} color={q.soft} leading={1.65}>{item.description}</Text>
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>

      {/* No Inspect button: inspect links open the game, which phones can't run */}
      {item.marketable ? (
        <View style={[ styles.actions, { paddingBottom: insets.bottom + 14 } ]}>
          <Pill label="Community Market ↗" style={styles.flex} onPress={() => WebBrowser.openBrowserAsync(marketListingUrl(item.appid, item.marketName))} />
        </View>
      ) : null}
    </StackScreen>
  );
}

function Hero({ item }: { item: InventoryItem }) {
  const q = useQ();
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  const drift = useSharedValue(0);
  // 0 until the image has loaded, then it rises into its float
  const shown = useSharedValue(0);
  useEffect(() => {
    if (!reduceMotion) {
      drift.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
    }
  }, [ drift, reduceMotion ]);
  const floatStyle = useAnimatedStyle(() => ({
    transform: [ { translateY: -8 * drift.value }, { rotate: `${-2 + 3 * drift.value}deg` } ],
  }));
  const revealStyle = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: reduceMotion ? [] : [ { translateY: 18 * (1 - shown.value) }, { scale: 0.92 + 0.08 * shown.value } ],
  }));
  const reveal = () => {
    shown.set(withTiming(1, { duration: reduceMotion ? 200 : 700, easing: Easing.bezier(0.2, 0.8, 0.2, 1) }));
  };

  return (
    <View style={styles.hero}>
      <RarityGlow color={steamColor(item.rarity?.color)} opacity={0.18} />
      <Animated.View style={[ styles.heroImageWrap, revealStyle ]}>
        <Animated.View style={[ styles.heroImage, floatStyle ]}>
          <ItemImage
            iconUrl={item.iconUrl}
            size={512}
            style={styles.heroImage}
            contentFit="contain"
            onLoad={reveal}
            onError={reveal}
          />
        </Animated.View>
      </Animated.View>
      {item.nameTag ? (
        <View style={styles.nameTag}>
          <Text size={12} color={q.soft} numberOfLines={1}>“{item.nameTag}”</Text>
        </View>
      ) : null}
      {item.amount > 1 ? <Text size={12} mono color={q.muted} style={styles.amount}>×{item.amount}</Text> : null}
    </View>
  );
}

function PriceBlock({ price, amount, formatPrice }: { price: ItemPrice; amount: number; formatPrice: Format }) {
  const q = useQ();
  const styles = useStyles();
  const current = price.price ?? null;
  const day = percentChange(price.p24ago, current);
  return (
    <View style={styles.priceBlock}>
      <Text size={48} weight="extralight" tracking={-0.05} tabular>{formatPrice(current)}</Text>
      <Text size={14} color={q.muted}>
        <Text size={14} color={toneOf(day, q)}>{pctLabel(day)}</Text>
        {' in 24 h'}
        {amount > 1 && current !== null ? ` · ${formatPrice(current * amount)} for ${amount}` : ''}
      </Text>
    </View>
  );
}

function Applied({ title, list, formatPrice }: { title: string; list: readonly ItemSticker[]; formatPrice: Format }) {
  const q = useQ();
  const styles = useStyles();
  const total = list.reduce((sum, s) => sum + (s.price || 0), 0);
  return (
    <View>
      <View style={styles.blockHead}>
        <Text size={13} color={q.muted}>{title} ({list.length})</Text>
        <Text size={13} color={q.dim} tabular>Applied value {formatPrice(total)}</Text>
      </View>
      {list.map((sticker, i) => (
        <View key={`${sticker.longName}-${i}`} style={styles.stickerRow}>
          <ItemImage uri={sticker.img} style={styles.sticker} contentFit="contain" />
          <Text size={14} style={styles.flex} numberOfLines={2}>{sticker.name}</Text>
          <Text size={14} color={q.muted} tabular>{formatPrice(sticker.price || null)}</Text>
        </View>
      ))}
    </View>
  );
}

const DAILY_LABELS = { value: 'Price', count: 'Listings', countUnit: 'listings', valueName: 'Average price', countName: 'Listings' };

const CHART_RANGES: { value: ItemHistoryRange; label: string }[] = [
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '1y', label: '1 year' },
  { value: 'all', label: 'All time' },
];

/** A UTC day ("YYYY-MM-DD") as local midnight, so it's labelled with the same day */
const localDay = (day: string) => {
  const [ y, m, d ] = day.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
};

function MarketBlocks({ price, item, formatPrice }: { price: ItemPrice; item: InventoryItem; formatPrice: Format }) {
  const q = useQ();
  const styles = useStyles();
  const current = price.price ?? null;
  // 30 days comes with the inventory; longer periods come from the item's market page data when chosen
  const [ range, setRange ] = useState<ItemHistoryRange>('30d');
  const longer = useMarketItem(item.appid, item.marketName, range, { enabled: range !== '30d' && item.marketable });
  const daily = range === '30d'
    ? (price.daily ?? []).map(([ day, value, count ]) => ({ t: localDay(day), value, count }))
    : (longer.data?.history.points ?? []).map(([ day, value, count ]) => ({ t: localDay(day), value, count }));
  const rangePct = daily.length > 1 ? percentChange(daily[0].value, daily[daily.length - 1].value) : null;
  const loading = range !== '30d' && (longer.isLoading || longer.isPlaceholderData);

  const market = [
    { label: 'Avg 30 d', value: formatPrice(price.avg30) },
    // Without price ranges (an older API), the all-time low and high are only here
    ...(price.ranges ? [] : [ { label: 'Lowest', value: formatPrice(price.min) }, { label: 'Highest', value: formatPrice(price.max) } ]),
    { label: 'Listings', value: price.listed ? price.listed.toLocaleString('en-US') : '—' },
  ];
  const history = [
    { label: '24 h ago', from: price.p24ago },
    { label: '30 days ago', from: price.p30ago },
    { label: '90 days ago', from: price.p90ago },
    { label: '1 year ago', from: price.yearAgo },
  ];

  return (
    <>
      {(price.daily?.length ?? 0) > 1 || range !== '30d' ? (
        <View>
          <Text size={13} color={q.muted} style={styles.gridTitle}>Price history</Text>
          <View style={styles.periods}>
            <PeriodChips options={CHART_RANGES} value={range} onChange={setRange} label="Price history period" />
          </View>
          <View style={[ styles.daily, loading && styles.loading ]}>
            {daily.length > 1 ? (
              <HistoryChart
                key={range}
                points={daily}
                formatPrice={formatPrice}
                labels={DAILY_LABELS}
                color={rangePct !== null && rangePct < 0 ? q.danger : q.accent}
              />
            ) : (
              <Text size={14} color={q.dim}>
                {loading ? 'Loading…' : longer.isError ? 'The price history couldn\'t be loaded.' : 'Not enough prices in this period yet.'}
              </Text>
            )}
          </View>
        </View>
      ) : null}

      <View>
        <Text size={13} color={q.muted} style={styles.gridTitle}>Market</Text>
        <View style={styles.grid}>
          {market.map(m => (
            <View key={m.label} style={[ styles.cell, { width: '33.33%' } ]}>
              <Text size={12} color={q.dim}>{m.label}</Text>
              <Text size={16} tabular numberOfLines={1} adjustsFontSizeToFit>{m.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {price.ranges ? (
        <View>
          <Text size={13} color={q.muted} style={styles.gridTitle}>Price ranges</Text>
          <PriceRanges ranges={price.ranges} price={current} formatPrice={formatPrice} />
        </View>
      ) : (
        <View>
          <Text size={13} color={q.muted} style={styles.gridTitle}>Price history</Text>
          <View style={styles.grid}>
            {history.map(h => {
              const p = percentChange(h.from, current);
              return (
                <View key={h.label} style={[ styles.cell, { width: '50%' } ]}>
                  <Text size={12} color={q.dim}>{h.label}</Text>
                  <Text size={16} tabular>{formatPrice(h.from)}</Text>
                  <Text size={11} mono color={toneOf(p, q)}>{pctLabel(p)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </>
  );
}

function Details({ item }: { item: InventoryItem }) {
  const q = useQ();
  const styles = useStyles();
  const rows = [
    [ 'Type', item.itemType ],
    [ 'Exterior', item.condition ],
    [ 'Rarity', item.rarity?.name ],
    [ 'Collection', item.collection ],
    [ 'Pattern', item.skinProps ? String(item.skinProps.pattern) : undefined ],
    [ 'Phase', item.phase ],
    [ 'Name tag', item.nameTag ? `“${item.nameTag}”` : undefined ],
    [ 'Quantity', String(item.amount) ],
    [ 'Tradable', item.tradable ? 'Yes' : 'No' ],
    [ 'Marketable', item.marketable ? 'Yes' : 'No' ],
  ].filter((row): row is [ string, string ] => !!row[1]);
  return (
    <View>
      <Text size={13} color={q.muted} style={styles.detailsTitle}>Details</Text>
      {rows.map(([ label, value ]) => (
        <View key={label} style={styles.detailRow}>
          <Text size={14} color={q.dim}>{label}</Text>
          <Text size={14} align="right" style={styles.flex}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

const pctLabel = (p: number | null) => (p === null || !Number.isFinite(p) ? '—' : `${p >= 0 ? '+' : ''}${p.toFixed(1)}%`);
const toneOf = (p: number | null, q: Palette) => (p === null || !Number.isFinite(p) ? q.dim : p >= 0 ? q.accent : q.danger);

const useStyles = makeStyles(q => ({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: GUTTER,
    paddingTop: 4,
    paddingBottom: 32,
  },
  gapTop: {
    marginTop: 24,
  },
  stack: {
    gap: 30,
  },
  position: {
    minWidth: 44,
    textAlign: 'center',
  },
  hero: {
    height: 270,
    borderRadius: 24,
    backgroundColor: q.raised,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImageWrap: {
    width: '72%',
    height: '72%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  nameTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    maxWidth: '70%',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: q.bg,
    borderWidth: 1,
    borderColor: q.line3,
  },
  amount: {
    position: 'absolute',
    bottom: 14,
    right: 16,
  },
  titleBlock: {
    gap: 8,
  },
  phase: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: q.line3,
  },
  periods: {
    paddingTop: 12,
  },
  loading: {
    opacity: 0.5,
  },
  kicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priceBlock: {
    gap: 6,
  },
  block: {
    gap: 10,
  },
  blockHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  stickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: q.line2,
  },
  sticker: {
    width: 34,
    height: 26,
  },
  daily: {
    paddingTop: 14,
  },
  gridTitle: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: q.line2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 14,
    rowGap: 18,
  },
  cell: {
    gap: 3,
    paddingRight: 12,
  },
  detailsTitle: {
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: q.line,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: q.line,
    backgroundColor: q.bg,
  },
}));
