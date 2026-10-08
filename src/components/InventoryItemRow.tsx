import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import type { InventoryItem } from '@/api/types';
import { itemImageUrl, itemPrice, steamColor } from '@/utils/steam';

interface Props {
  item: InventoryItem;
  formatPrice: (usd: number | null | undefined) => string;
  onPress: (item: InventoryItem) => void;
}

export const InventoryItemRow = memo(({ item, formatPrice, onPress }: Props) => {
  const theme = useTheme();
  const price = itemPrice(item);
  const subtitle = [ item.condition, item.itemType ].filter(Boolean).join(' · ');

  return (
    <TouchableRipple onPress={() => onPress(item)} accessibilityRole="button">
      <View style={styles.row}>
        <View style={[ styles.imageWrap, { backgroundColor: theme.colors.surfaceVariant } ]}>
          <Image source={{ uri: itemImageUrl(item.iconUrl, 128) }} style={styles.image} contentFit="contain" recyclingKey={item.iconUrl} />
          {item.rarity?.color ? <View style={[ styles.rarity, { backgroundColor: steamColor(item.rarity.color) } ]} /> : null}
        </View>
        <View style={styles.body}>
          <Text variant="bodyLarge" numberOfLines={1}>{item.name}</Text>
          <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>{subtitle}</Text>
        </View>
        <View style={styles.prices}>
          <Text variant="titleSmall">{price === null ? '—' : formatPrice(price * item.amount)}</Text>
          {item.amount > 1 && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {price === null ? `×${item.amount}` : `${item.amount} × ${formatPrice(price)}`}
            </Text>
          )}
          {!item.tradable && <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Not tradable</Text>}
        </View>
      </View>
    </TouchableRipple>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 16,
  },
  imageWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 52,
    height: 52,
  },
  rarity: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  prices: {
    alignItems: 'flex-end',
    gap: 2,
  },
});
