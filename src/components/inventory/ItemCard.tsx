import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { InventoryItem } from '@/api/types';
import { Text } from '@/components/quiet/Text';
import { q } from '@/theme';
import { itemImageUrl, itemPrice, steamColor } from '@/utils/steam';

/** Soft rarity-coloured glow behind an item image. A gradient, not a blur, so it stays cheap. */
export function RarityGlow({ color, opacity = 0.14 }: { color?: string; opacity?: number }) {
  if (!color) {
    return null;
  }
  // Ids are page-wide on web, so name the gradient after its colour
  const id = `glow-${color.replace(/[^0-9a-z]/gi, '')}-${Math.round(opacity * 100)}`;
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="55%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

interface Props {
  item: InventoryItem;
  index: number;
  formatPrice: (usd: number | null | undefined) => string;
  onPress: (item: InventoryItem) => void;
}

// Only the first rows stagger in; animating hundreds of cards at once stutters
const STAGGERED = 12;

export const ItemCard = memo(({ item, index, formatPrice, onPress }: Props) => {
  const price = itemPrice(item);
  const rarity = steamColor(item.rarity?.color);
  const nameColor = item.nameColor && item.nameColor.toLowerCase() !== 'd2d2d2' ? steamColor(item.nameColor) : q.text;
  const applied = Math.min(6, (item.stickers?.length ?? 0) + (item.patches?.length ?? 0) + (item.charms?.length ?? 0));
  const float = item.skinProps?.float ? Number(item.skinProps.float) : null;
  const wear = [ item.condition, float !== null && Number.isFinite(float) ? float.toFixed(4) : null ].filter(Boolean).join(' · ');
  const priceLabel = price === null ? 'No price' : formatPrice(price * item.amount);

  return (
    <Animated.View entering={index < STAGGERED ? FadeInDown.duration(450).delay(40 + index * 35) : undefined} style={styles.cell}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${priceLabel}. Show details`}
        onPress={() => onPress(item)}
        style={styles.card}
      >
        {({ pressed }) => (
          <>
            <View style={[ styles.stage, pressed && styles.stagePressed ]}>
              <RarityGlow color={rarity} />
              <Image source={{ uri: itemImageUrl(item.iconUrl, 256) }} style={styles.image} contentFit="contain" recyclingKey={item.iconUrl} transition={150} />
              {rarity ? <View style={[ styles.rarityDot, { backgroundColor: rarity } ]} /> : null}
              {item.amount > 1 ? <Text size={11} mono color={q.muted} style={styles.amount}>×{item.amount}</Text> : null}
              {applied > 0 ? (
                <View style={styles.applied}>
                  {Array.from({ length: applied }, (_, i) => <View key={i} style={styles.appliedDot} />)}
                </View>
              ) : null}
            </View>
            <View style={styles.body}>
              <Text size={14} leading={1.35} numberOfLines={2} color={nameColor}>{item.name}</Text>
              <Text size={12} color={q.dim} numberOfLines={1}>{item.itemType}</Text>
              {wear ? <Text size={12} color={q.dim} tabular numberOfLines={1}>{wear}</Text> : null}
              <View style={styles.priceRow}>
                <Text size={14} tabular color={price === null ? q.faint : q.text}>{priceLabel}</Text>
                {!item.tradable ? <Text size={9} mono color={q.faint} tracking={0.06}>NOT TRADABLE</Text> : null}
              </View>
            </View>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
});
ItemCard.displayName = 'ItemCard';

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    paddingHorizontal: 7,
    paddingBottom: 28,
  },
  card: {
    gap: 12,
  },
  stage: {
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor: q.raised,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stagePressed: {
    backgroundColor: '#17171A',
    transform: [ { scale: 0.98 } ],
  },
  image: {
    width: '72%',
    height: '72%',
  },
  rarityDot: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  amount: {
    position: 'absolute',
    bottom: 10,
    right: 12,
  },
  applied: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 3,
  },
  appliedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: q.faint,
  },
  body: {
    gap: 3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
});
