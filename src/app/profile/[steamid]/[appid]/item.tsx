import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, List, Text, useTheme } from 'react-native-paper';

import { useInventory } from '@/api/queries';
import type { ItemPrice, ItemSticker } from '@/api/types';
import { PriceChange } from '@/components/PriceChange';
import { ErrorView, LoadingView, MessageView } from '@/components/StateViews';
import { useFormatPrice } from '@/utils/currency';
import { itemImageUrl, itemKey, marketListingUrl, percentChange, steamColor } from '@/utils/steam';

export default function ItemScreen() {
  const theme = useTheme();
  const { steamid, appid, key } = useLocalSearchParams<{ steamid: string; appid: string; key: string }>();
  const inventory = useInventory(steamid, +appid);
  const formatPrice = useFormatPrice();

  if (inventory.isPending) {
    return <LoadingView />;
  }
  if (inventory.isError) {
    return <ErrorView error={inventory.error} onRetry={inventory.refetch} />;
  }

  const item = inventory.data.items.find(i => itemKey(i) === key);
  if (!item) {
    return <MessageView icon="help-circle-outline" title="Item not found" message="It may have left this inventory." />;
  }

  const price = item.price.found ? item.price : null;
  const rarityColor = steamColor(item.rarity?.color);
  const inspectLink = resolveInspectLink(item.inspectLink, steamid);
  const applied: { title: string; list: ItemSticker[] }[] = [
    { title: 'Stickers', list: item.stickers ?? [] },
    { title: 'Patches', list: item.patches ?? [] },
    { title: 'Charms', list: item.charms ?? [] },
  ].filter(group => group.list.length > 0);

  return (
    <>
      <Stack.Screen options={{ title: item.name }} />
      <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
        <View style={[ styles.hero, { backgroundColor: theme.colors.surfaceVariant } ]}>
          <Image source={{ uri: itemImageUrl(item.iconUrl, 512) }} style={styles.heroImage} contentFit="contain" />
          {rarityColor && <View style={[ styles.rarityBar, { backgroundColor: rarityColor } ]} />}
        </View>

        <View style={styles.section}>
          <Text variant="headlineSmall">{item.name}</Text>
          {item.nameTag ? <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>“{item.nameTag}”</Text> : null}
          <View style={styles.chips}>
            {item.rarity && <Chip compact icon="diamond-stone">{item.rarity.name}</Chip>}
            {item.condition && <Chip compact>{item.condition}</Chip>}
            {item.amount > 1 && <Chip compact>{`× ${item.amount}`}</Chip>}
            {!item.tradable && <Chip compact icon="lock-outline">Not tradable</Chip>}
            {!item.marketable && <Chip compact icon="store-off-outline">Not marketable</Chip>}
          </View>
        </View>

        {price ? <PriceCard price={price} amount={item.amount} formatPrice={formatPrice} /> : (
          <Card mode="contained" style={styles.card}>
            <Card.Content>
              <Text variant="bodyMedium">No market price available for this item.</Text>
            </Card.Content>
          </Card>
        )}

        <List.Section>
          <List.Subheader>Details</List.Subheader>
          <List.Item title="Type" description={item.itemType} />
          {item.collection && <List.Item title="Collection" description={item.collection} />}
          {item.skinProps && (
            <>
              <List.Item title="Float" description={item.skinProps.float} />
              <List.Item title="Pattern" description={String(item.skinProps.pattern)} />
            </>
          )}
        </List.Section>

        {applied.map(group => (
          <List.Section key={group.title}>
            <List.Subheader>{group.title}</List.Subheader>
            {group.list.map((sticker, i) => (
              <List.Item
                key={`${sticker.longName}-${i}`}
                title={sticker.name}
                titleNumberOfLines={2}
                left={({ style }) => <Image source={{ uri: sticker.img }} style={[ style, styles.sticker ]} contentFit="contain" />}
                right={({ style }) => <Text style={[ style, styles.stickerPrice ]} variant="bodyMedium">{formatPrice(sticker.price || null)}</Text>}
              />
            ))}
          </List.Section>
        ))}

        {item.description ? (
          <View style={styles.section}>
            <Text variant="titleSmall">Description</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{item.description}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          {item.marketable && (
            <Button mode="contained" icon="store" onPress={() => WebBrowser.openBrowserAsync(marketListingUrl(item.appid, item.marketName))}>
              View on Steam Market
            </Button>
          )}
          {inspectLink && (
            <Button mode="outlined" icon="eye-outline" onPress={() => Linking.openURL(inspectLink)}>
              Inspect in game
            </Button>
          )}
        </View>
      </ScrollView>
    </>
  );
}

/**
 * Steam returns inspect links as templates (%owner_steamid%, %assetid%).
 * The API doesn't expose asset IDs, so links that still have placeholders can't be used.
 */
function resolveInspectLink(link: string | undefined, steamid: string) {
  const resolved = link?.replace('%owner_steamid%', steamid);
  return resolved && !/%[a-z_]+%/i.test(resolved) ? resolved : null;
}

interface PriceCardProps {
  price: ItemPrice;
  amount: number;
  formatPrice: (usd: number | null | undefined) => string;
}

function PriceCard({ price, amount, formatPrice }: PriceCardProps) {
  const theme = useTheme();
  const current = price.price ?? null;
  const changes = [
    { label: '24 hours', from: price.p24ago },
    { label: '30 days', from: price.p30ago },
    { label: '90 days', from: price.p90ago },
    { label: '1 year', from: price.yearAgo },
  ];

  return (
    <Card mode="contained" style={styles.card}>
      <Card.Content style={styles.priceContent}>
        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>Market price</Text>
        <Text variant="displaySmall">{formatPrice(current)}</Text>
        {amount > 1 && current !== null && (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{`${formatPrice(current * amount)} for ${amount}`}</Text>
        )}
        {price.listed ? <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{`${price.listed.toLocaleString()} listed`}</Text> : null}

        <View style={styles.grid}>
          {changes.map(c => (
            <Cell key={c.label} label={c.label}>
              <PriceChange variant="titleMedium" percent={percentChange(c.from, current)} />
            </Cell>
          ))}
        </View>
        <View style={styles.grid}>
          <Cell label="24h avg"><Text variant="titleSmall">{formatPrice(price.avg24)}</Text></Cell>
          <Cell label="7d avg"><Text variant="titleSmall">{formatPrice(price.avg7)}</Text></Cell>
          <Cell label="30d avg"><Text variant="titleSmall">{formatPrice(price.avg30)}</Text></Cell>
          <Cell label="Min / max">
            <Text variant="titleSmall" numberOfLines={1} adjustsFontSizeToFit>{`${formatPrice(price.min)} / ${formatPrice(price.max)}`}</Text>
          </Cell>
        </View>
      </Card.Content>
    </Card>
  );
}

function Cell({ label, children }: { label: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.cell}>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  hero: {
    margin: 16,
    borderRadius: 28,
    aspectRatio: 4 / 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImage: {
    width: '85%',
    height: '85%',
  },
  rarityBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  section: {
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  priceContent: {
    gap: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  cell: {
    width: '50%',
    paddingVertical: 6,
  },
  sticker: {
    width: 48,
    height: 36,
  },
  stickerPrice: {
    alignSelf: 'center',
  },
  actions: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
});
