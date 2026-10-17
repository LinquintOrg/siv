import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useProfileGames } from '@/api/queries';
import { Row, SectionTitle } from '@/components/quiet/Controls';
import { Text } from '@/components/quiet/Text';
import { makeStyles, useQ } from '@/theme';

/** "3 h ago" style label */
function checkedAgo(date: string) {
  const hours = Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000);
  if (hours < 1) return 'within the hour';
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

/**
 * The profile's other game inventories, as last checked (from the leaderboard), and all its games added up with
 * this game's current value. Nothing when the profile has no other games.
 */
export function OtherGames({ steamid, appid, currentValue, gameName, formatPrice }: {
  steamid: string;
  appid: number;
  currentValue: number;
  gameName: string;
  formatPrice: (usd: number | null | undefined) => string;
}) {
  const q = useQ();
  const styles = useStyles();
  const games = useProfileGames(steamid);
  const others = (games.data ?? []).filter(entry => entry.appid !== appid);
  if (!others.length) {
    return null;
  }
  const total = currentValue + others.reduce((sum, entry) => sum + Number(entry.inventory_value), 0);

  return (
    <Animated.View entering={FadeIn.duration(500).delay(250)} style={styles.section}>
      <SectionTitle>Other games {others.length}</SectionTitle>
      <View style={styles.total}>
        <Text size={13} color={q.muted}>All {others.length + 1} games together</Text>
        <Text size={30} weight="light" tracking={-0.02} tabular>{formatPrice(total)}</Text>
        <Text size={12} color={q.dim}>{gameName} now, the others as last checked</Text>
      </View>
      {others.map(entry => (
        <Row
          key={entry.appid}
          accessibilityLabel={`${entry.game_title} inventory, ${formatPrice(entry.inventory_value)}`}
          onPress={() => router.setParams({ appid: String(entry.appid) })}
        >
          <View style={styles.icon}>
            {entry.game_icon ? <Image source={{ uri: entry.game_icon }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
          </View>
          <View style={styles.flex}>
            <Text size={16} weight="light" numberOfLines={1}>{entry.game_title}</Text>
            <Text size={12} color={q.dim}>
              {entry.item_count.toLocaleString('en-US')} {entry.item_count === 1 ? 'item' : 'items'} · checked {checkedAgo(entry.last_updated)}
            </Text>
          </View>
          <Text size={16} tabular>{formatPrice(entry.inventory_value)}</Text>
          <Feather name="arrow-right" size={16} color={q.faint} />
        </Row>
      ))}
    </Animated.View>
  );
}

const useStyles = makeStyles(q => ({
  section: {
    marginTop: 40,
  },
  total: {
    gap: 4,
    marginBottom: 12,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: q.raised,
  },
}));
