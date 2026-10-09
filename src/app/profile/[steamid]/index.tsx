import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useInventoryGames, useProfile } from '@/api/queries';
import { Avatar, Row, SectionTitle, Skeleton, quietRefresh } from '@/components/quiet/Controls';
import { StackScreen } from '@/components/quiet/Screen';
import { Text } from '@/components/quiet/Text';
import { useToast } from '@/components/quiet/Toaster';
import { ErrorView } from '@/components/StateViews';
import { useIsFavorite, useProfiles } from '@/stores/profiles';
import { GUTTER, q } from '@/theme';
import { profileUrl } from '@/utils/steam';

export default function ProfileScreen() {
  const { steamid } = useLocalSearchParams<{ steamid: string }>();
  const profile = useProfile(steamid);
  const games = useInventoryGames();
  const isFavorite = useIsFavorite(steamid);
  const { toggleFavorite, addRecent } = useProfiles();
  const showToast = useToast(state => state.show);

  useEffect(() => {
    if (profile.data) {
      addRecent(profile.data);
    }
  }, [ profile.data, addRecent ]);

  const data = profile.data;
  const memberSince = data?.timecreated
    ? new Date(data.timecreated * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const right = data ? (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: isFavorite }}
        onPress={() => {
          toggleFavorite(data);
          showToast(isFavorite ? `Removed ${data.personaname} from favourites` : `${data.personaname} added to favourites`);
        }}
        style={styles.action}
        hitSlop={4}
      >
        <Feather name="star" size={16} color={isFavorite ? q.gold : q.muted} />
        <Text size={14} color={isFavorite ? q.gold : q.muted}>{isFavorite ? 'Favourited' : 'Favourite'}</Text>
      </Pressable>
      <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(profileUrl(data.steamid))} style={styles.action} hitSlop={4}>
        <Text size={14} color={q.muted}>Steam ↗</Text>
      </Pressable>
    </>
  ) : null;

  if (profile.isError) {
    return (
      <StackScreen>
        <ErrorView title="Couldn't load this profile" error={profile.error} onRetry={profile.refetch} />
      </StackScreen>
    );
  }

  return (
    <StackScreen right={right}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={quietRefresh(profile.isRefetching, () => {
          profile.refetch();
          games.refetch();
        })}
      >
        {data ? (
          <Animated.View entering={FadeInDown.duration(450)} style={styles.header}>
            <Avatar uri={data.avatarfull} name={data.personaname} size={72} />
            <Text size={40} weight="extralight" tracking={-0.045} style={styles.name}>{data.personaname}</Text>
            {data.realname ? <Text size={15} color={q.muted}>{data.realname}</Text> : null}
            <Text size={11} mono color={q.dim}>{data.steamid}{memberSince ? ` · member since ${memberSince}` : ''}</Text>
          </Animated.View>
        ) : (
          <View style={styles.header} accessibilityLabel="Loading profile">
            <Skeleton width={72} height={72} radius={36} />
            <Skeleton width="60%" height={34} radius={6} style={styles.name} />
            <Skeleton width="75%" height={10} />
          </View>
        )}

        <Animated.View entering={FadeInDown.duration(450).delay(80)} style={styles.section}>
          <SectionTitle>Inventories</SectionTitle>
          {games.isPending ? [ 0, 1, 2, 3 ].map(i => (
            <Row key={i}>
              <Skeleton width={44} height={44} radius={12} />
              <Skeleton width="45%" height={14} />
            </Row>
          )) : null}
          {games.isError ? <Text size={14} color={q.danger}>{games.error.message}</Text> : null}
          {games.data?.map(game => (
            <Row
              key={game.appid}
              accessibilityLabel={`${game.name} inventory`}
              onPress={() => router.push({ pathname: '/profile/[steamid]/[appid]', params: { steamid, appid: String(game.appid) } })}
            >
              <View style={styles.gameIcon}>
                <Image source={{ uri: game.icon }} style={StyleSheet.absoluteFill} contentFit="cover" />
              </View>
              <Text size={17} weight="light" style={styles.flex}>{game.name}</Text>
              <Feather name="arrow-right" size={16} color={q.faint} />
            </Row>
          ))}
          <Text size={13} color={q.dim} leading={1.6} style={styles.note}>
            Only public inventories can be priced. Steam › Edit Profile › Privacy Settings.
          </Text>
        </Animated.View>
      </ScrollView>
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: GUTTER,
    paddingTop: 20,
    paddingBottom: 48,
  },
  flex: {
    flex: 1,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 10,
  },
  header: {
    gap: 12,
  },
  name: {
    marginTop: 6,
  },
  section: {
    marginTop: 44,
  },
  gameIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: q.raised,
  },
  note: {
    marginTop: 18,
  },
});
