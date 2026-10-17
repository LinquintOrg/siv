import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError, WEB_URL } from '@/api/client';
import { useMarketItem } from '@/api/queries';
import type { ItemHistoryRange, MarketItemPage } from '@/api/types';
import { HistoryChart } from '@/components/inventory/HistoryChart';
import { Pill, Row, Skeleton } from '@/components/quiet/Controls';
import { StackScreen } from '@/components/quiet/Screen';
import { Text } from '@/components/quiet/Text';
import { ErrorView, MessageView } from '@/components/StateViews';
import { GUTTER, makeStyles, useQ, type Palette } from '@/theme';
import { useFormatPrice } from '@/utils/currency';
import { itemImageUrl, marketListingUrl, percentChange } from '@/utils/steam';

type Format = (usd: number | null | undefined) => string;
type Variant = NonNullable<MarketItemPage['variants']>[number];

const RANGES: { value: ItemHistoryRange; label: string }[] = [
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '1y', label: '1 year' },
  { value: 'all', label: 'All time' },
];
const QUALITY_LABELS: Record<Variant['quality'], string> = { normal: 'Normal', stattrak: 'StatTrak™', souvenir: 'Souvenir' };
const WEAR_SHORT: Record<string, string> = {
  'Factory New': 'FN',
  'Minimal Wear': 'MW',
  'Field-Tested': 'FT',
  'Well-Worn': 'WW',
  'Battle-Scarred': 'BS',
};
const CHART_LABELS = { value: 'Price', count: 'Listings', countUnit: 'listings', valueName: 'Average price', countName: 'Listings' };

/**
 * An item's market page, like the web's /item/:appid/:hash: its price, price history, statistics and, for CS2, its
 * other wears and versions, the cases it drops from and items from the same collection.
 */
export default function MarketItemScreen() {
  const q = useQ();
  const styles = useStyles();
  const { appid, hash } = useLocalSearchParams<{ appid: string; hash: string }>();
  const [ range, setRange ] = useState<ItemHistoryRange>('90d');
  const page = useMarketItem(+appid, hash, range);
  const formatPrice = useFormatPrice();
  const insets = useSafeAreaInsets();

  if (page.isPending) {
    return (
      <StackScreen>
        <View style={styles.content} accessibilityLabel="Loading item">
          <Skeleton height={240} radius={24} />
          <Skeleton width="40%" height={12} style={styles.gapTop} />
          <Skeleton width="85%" height={30} radius={6} style={styles.gapSmall} />
          <Skeleton width="45%" height={44} radius={8} style={styles.gapSmall} />
          <Skeleton height={128} radius={14} style={styles.gapTop} />
        </View>
      </StackScreen>
    );
  }
  if (page.isError) {
    if (page.error instanceof ApiError && page.error.status === 404) {
      return <StackScreen><MessageView title="Item not found" message="There's no such item on the Steam Community Market." /></StackScreen>;
    }
    return <StackScreen><ErrorView title="Couldn't load this item" error={page.error} onRetry={page.refetch} /></StackScreen>;
  }

  const data = page.data;
  const price = data.price;
  const day = price ? percentChange(price.p24ago, price.latest) : null;
  const points = data.history.points.map(([ date, value, count ]) => {
    // Days are UTC dates; build them as local midnight so they're labelled with the same day
    const [ y, m, d ] = date.split('-').map(Number);
    return { t: new Date(y, m - 1, d).getTime(), value, count };
  });
  const rangePct = points.length > 1 ? percentChange(points[0].value, points[points.length - 1].value) : null;
  // A different item keeps the same screen, so going back leaves the item pages instead of stepping through them
  const open = (other: string) => router.setParams({ hash: other });

  return (
    <StackScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View key={data.item.hash} entering={FadeIn.duration(300)} style={styles.stack}>
          <View style={styles.hero}>
            {data.item.image ? (
              <Image source={{ uri: itemImageUrl(data.item.image, 512) }} style={styles.heroImage} contentFit="contain" transition={250} />
            ) : null}
          </View>

          <View style={styles.titleBlock}>
            <Text size={13} color={q.muted}>{[ data.game, data.item.type ].filter(Boolean).join(' · ')}</Text>
            <Text size={30} weight="light" tracking={-0.03} leading={1.12} selectable>{data.item.hash}</Text>
          </View>

          {price ? (
            <View style={styles.priceBlock}>
              <Text size={48} weight="extralight" tracking={-0.05} tabular>{formatPrice(price.latest)}</Text>
              <Text size={14} color={q.muted}>
                {listingsLabel(price.listed)}
                {day !== null ? ' · ' : ''}
                {day !== null ? <Text size={14} color={toneOf(day, q)}>{pctLabel(day)}</Text> : null}
                {day !== null ? ' in 24 h' : ''}
              </Text>
              {data.sales ? (
                <Text size={14} color={q.muted}>
                  <Text size={14} tabular>{data.sales.volume.toLocaleString('en-US')}</Text>
                  {' sold in the last 24 hours'}
                  {data.sales.median ? `, at a median of ${formatPrice(data.sales.median)}` : ''}
                </Text>
              ) : null}
            </View>
          ) : (
            <Text size={15} color={q.muted} leading={1.6}>No recent price on the Steam Community Market.</Text>
          )}

          <Versions variants={data.variants ?? []} current={data.item.hash} formatPrice={formatPrice} onOpen={open} />

          <View>
            <View style={styles.sectionHead}>
              <Text size={13} color={q.muted}>Price history</Text>
            </View>
            <View style={styles.chips}>
              {RANGES.map(option => (
                <Chip key={option.value} label={option.label} selected={option.value === range} onPress={() => setRange(option.value)} />
              ))}
            </View>
            <View style={[ styles.chart, page.isPlaceholderData && styles.loading ]}>
              {points.length > 1 ? (
                <HistoryChart
                  points={points}
                  formatPrice={formatPrice}
                  labels={CHART_LABELS}
                  color={rangePct !== null && rangePct < 0 ? q.danger : q.accent}
                />
              ) : (
                <Text size={14} color={q.dim}>Not enough prices in this range yet.</Text>
              )}
            </View>
          </View>

          {price ? <Statistics price={price} formatPrice={formatPrice} /> : null}

          {data.containers?.length ? (
            <View>
              <View style={styles.sectionHead}>
                <Text size={13} color={q.muted}>Drops from</Text>
              </View>
              {data.containers.map(container => (
                <Row
                  key={`${container.kind}-${container.slug}`}
                  accessibilityLabel={`${container.name}, opens the website`}
                  onPress={() => WebBrowser.openBrowserAsync(`${WEB_URL}/${container.kind === 'case' ? 'cases' : 'collections'}/${container.slug}`)}
                >
                  <Text size={16} weight="light" style={styles.flex}>{container.name}</Text>
                  <Feather name="arrow-up-right" size={16} color={q.faint} />
                </Row>
              ))}
            </View>
          ) : null}

          {data.related?.length ? (
            <View>
              <View style={styles.sectionHead}>
                <Text size={13} color={q.muted}>
                  From the same {data.containers?.some(c => c.kind === 'collection') ? 'collection' : 'case'}
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.related}>
                {data.related.map(item => (
                  <Pressable
                    key={item.hash}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.hash}, ${formatPrice(item.price)}`}
                    onPress={() => open(item.hash)}
                    style={({ pressed }) => [ styles.relatedCard, { opacity: pressed ? 0.7 : 1 } ]}
                  >
                    <View style={[ styles.relatedImage, item.color ? { borderBottomColor: item.color } : null ]}>
                      {item.image ? <Image source={{ uri: itemImageUrl(item.image, 256) }} style={styles.relatedArt} contentFit="contain" /> : null}
                    </View>
                    <Text size={13} numberOfLines={2} leading={1.3}>{item.hash}</Text>
                    <Text size={13} color={q.dim} tabular>{formatPrice(item.price)}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>

      <View style={[ styles.actions, { paddingBottom: insets.bottom + 14 } ]}>
        <Pill
          label="Community Market ↗"
          style={styles.flex}
          onPress={() => WebBrowser.openBrowserAsync(marketListingUrl(data.item.appid, data.item.hash))}
        />
      </View>
    </StackScreen>
  );
}

/** The item's other wears and its StatTrak™ and Souvenir versions, a row per quality */
function Versions({ variants, current, formatPrice, onOpen }: {
  variants: Variant[];
  current: string;
  formatPrice: Format;
  onOpen: (hash: string) => void;
}) {
  const q = useQ();
  const styles = useStyles();
  if (variants.length < 2) {
    return null;
  }
  const qualities = (Object.keys(QUALITY_LABELS) as Variant['quality'][]).filter(quality => variants.some(v => v.quality === quality));
  return (
    <View>
      <View style={styles.sectionHead}>
        <Text size={13} color={q.muted}>Other versions</Text>
      </View>
      <View style={styles.versions}>
        {qualities.map(quality => (
          <View key={quality} style={styles.versionRow}>
            <Text size={12} color={q.dim} style={styles.versionLabel}>{QUALITY_LABELS[quality]}</Text>
            <View style={styles.chipsWrap}>
              {variants.filter(v => v.quality === quality).map(variant => (
                <Chip
                  key={variant.hash}
                  label={`${variant.wear ? WEAR_SHORT[variant.wear] ?? variant.wear : 'Vanilla'}  ${variant.price ? formatPrice(variant.price) : '—'}`}
                  selected={variant.hash === current}
                  onPress={() => variant.hash !== current && onOpen(variant.hash)}
                  accessibilityLabel={variant.hash}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function Statistics({ price, formatPrice }: { price: NonNullable<MarketItemPage['price']>; formatPrice: Format }) {
  const q = useQ();
  const styles = useStyles();
  const market = [
    { label: 'Avg 24 h', value: price.avg24 },
    { label: 'Avg 7 d', value: price.avg7 },
    { label: 'Avg 30 d', value: price.avg30 },
    { label: 'Avg 90 d', value: price.avg90 },
    { label: 'Avg 1 y', value: price.avg365 },
    { label: 'All-time low', value: price.min },
    { label: 'All-time high', value: price.max },
  ].filter(m => m.value != null);
  const history = [
    { label: '24 h ago', from: price.p24ago },
    { label: '30 days ago', from: price.p30ago },
    { label: '90 days ago', from: price.p90ago },
    { label: '1 year ago', from: price.yearAgo },
  ].filter(h => h.from != null);
  const since = price.firstSeen ? new Date(price.firstSeen).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

  return (
    <>
      <View>
        <View style={styles.sectionHead}>
          <Text size={13} color={q.muted}>Market</Text>
        </View>
        <View style={styles.grid}>
          {market.map(m => (
            <View key={m.label} style={[ styles.cell, { width: '33.33%' } ]}>
              <Text size={12} color={q.dim}>{m.label}</Text>
              <Text size={16} tabular numberOfLines={1} adjustsFontSizeToFit>{formatPrice(m.value)}</Text>
            </View>
          ))}
          {since ? (
            <View style={[ styles.cell, { width: '33.33%' } ]}>
              <Text size={12} color={q.dim}>Tracked since</Text>
              <Text size={16} numberOfLines={1} adjustsFontSizeToFit>{since}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {history.length ? (
        <View>
          <View style={styles.sectionHead}>
            <Text size={13} color={q.muted}>Price then</Text>
          </View>
          <View style={styles.grid}>
            {history.map(h => {
              const p = percentChange(h.from, price.latest);
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
      ) : null}
    </>
  );
}

function Chip({ label, selected, onPress, accessibilityLabel }: { label: string; selected: boolean; onPress: () => void; accessibilityLabel?: string }) {
  const q = useQ();
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [ styles.chip, { borderColor: selected ? q.text : q.line3, opacity: pressed ? 0.7 : 1 } ]}
    >
      <Text size={13} tabular color={selected ? q.text : q.muted}>{label}</Text>
    </Pressable>
  );
}

const listingsLabel = (listed: number | null) => (listed === 1 ? '1 listing' : `${(listed ?? 0).toLocaleString('en-US')} listings`);
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
  gapSmall: {
    marginTop: 12,
  },
  stack: {
    gap: 30,
  },
  hero: {
    height: 240,
    borderRadius: 24,
    backgroundColor: q.raised,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImage: {
    width: '72%',
    height: '72%',
  },
  titleBlock: {
    gap: 8,
  },
  priceBlock: {
    gap: 6,
  },
  sectionHead: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: q.line2,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 14,
  },
  chipsWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  chart: {
    paddingTop: 16,
  },
  loading: {
    opacity: 0.5,
  },
  versions: {
    paddingTop: 14,
    gap: 12,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  versionLabel: {
    width: 70,
    paddingTop: 8,
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
  related: {
    gap: 14,
    paddingTop: 14,
  },
  relatedCard: {
    width: 130,
    gap: 6,
  },
  relatedImage: {
    height: 110,
    borderRadius: 16,
    backgroundColor: q.raised,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  relatedArt: {
    width: '74%',
    height: '74%',
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
