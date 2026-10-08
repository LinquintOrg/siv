import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Avatar, Button, List, Text, useTheme } from 'react-native-paper';

import { useInventoryGames, useProfile } from '@/api/queries';
import { ErrorView, LoadingView } from '@/components/StateViews';
import { useIsFavorite, useProfiles } from '@/stores/profiles';
import { profileUrl } from '@/utils/steam';

export default function ProfileScreen() {
  const theme = useTheme();
  const { steamid } = useLocalSearchParams<{ steamid: string }>();
  const profile = useProfile(steamid);
  const games = useInventoryGames();
  const isFavorite = useIsFavorite(steamid);
  const { toggleFavorite, addRecent } = useProfiles();

  useEffect(() => {
    if (profile.data) {
      addRecent(profile.data);
    }
  }, [ profile.data, addRecent ]);

  if (profile.isPending) {
    return <LoadingView />;
  }
  if (profile.isError) {
    return <ErrorView error={profile.error} onRetry={profile.refetch} />;
  }

  const data = profile.data;
  const memberSince = data.timecreated ? new Date(data.timecreated * 1000).getFullYear() : null;

  return (
    <>
      <Stack.Screen
        options={{
          title: data.personaname,
          headerRight: () => (
            <Appbar.Action
              icon={isFavorite ? 'star' : 'star-outline'}
              accessibilityLabel={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
              onPress={() => toggleFavorite(data)}
            />
          ),
        }}
      />
      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={profile.isRefetching} onRefresh={() => {
          profile.refetch();
          games.refetch();
        }} />}
      >
        <View style={styles.header}>
          <Avatar.Image size={96} source={{ uri: data.avatarfull }} />
          <Text variant="headlineSmall" style={styles.center}>{data.personaname}</Text>
          {data.realname ? <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{data.realname}</Text> : null}
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {data.steamid}{memberSince ? ` · Member since ${memberSince}` : ''}
          </Text>
          <Button mode="outlined" icon="steam" onPress={() => WebBrowser.openBrowserAsync(profileUrl(data.steamid))} style={styles.steamButton}>
            Open Steam profile
          </Button>
        </View>

        <List.Section>
          <List.Subheader>Inventories</List.Subheader>
          {games.isPending && <LoadingView />}
          {games.isError && <ErrorView error={games.error} onRetry={games.refetch} />}
          {games.data?.map(game => (
            <List.Item
              key={game.appid}
              title={game.name}
              onPress={() => router.push({ pathname: '/profile/[steamid]/[appid]', params: { steamid, appid: String(game.appid) } })}
              left={({ style }) => <Image source={{ uri: game.icon }} style={[ style, styles.gameIcon ]} contentFit="cover" />}
              right={({ style, color }) => <List.Icon style={style} color={color} icon="chevron-right" />}
            />
          ))}
        </List.Section>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 4,
  },
  center: {
    textAlign: 'center',
    marginTop: 8,
  },
  steamButton: {
    marginTop: 12,
  },
  gameIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
});
