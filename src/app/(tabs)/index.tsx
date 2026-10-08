import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, HelperText, IconButton, List, Searchbar, Text, useTheme } from 'react-native-paper';

import { api } from '@/api/client';
import { queryKeys } from '@/api/queries';
import type { SteamProfile } from '@/api/types';
import { ProfileRow } from '@/components/ProfileRow';
import { useProfiles, type SavedProfile } from '@/stores/profiles';

export default function SearchScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [ query, setQuery ] = useState('');
  const { favorites, recent, addRecent, removeRecent, clearRecent } = useProfiles();

  const search = useMutation({
    mutationFn: (input: string) => api.searchProfile(input),
    onSuccess: (profile: SteamProfile) => {
      queryClient.setQueryData(queryKeys.profile(profile.steamid), profile);
      addRecent(profile);
      setQuery('');
      openProfile(profile.steamid);
    },
  });

  const submit = () => {
    const input = query.trim();
    if (input && !search.isPending) {
      Keyboard.dismiss();
      search.mutate(input);
    }
  };

  const openProfile = (steamid: string) => router.push({ pathname: '/profile/[steamid]', params: { steamid } });

  const renderSaved = (profile: SavedProfile, onRemove?: () => void) => (
    <ProfileRow
      key={profile.steamid}
      name={profile.name}
      avatar={profile.avatar}
      description={profile.steamid}
      onPress={() => openProfile(profile.steamid)}
      right={onRemove ? <IconButton icon="close" size={20} onPress={onRemove} accessibilityLabel={`Remove ${profile.name}`} /> : undefined}
    />
  );

  return (
    <View style={[ styles.flex, { backgroundColor: theme.colors.background } ]}>
      <Appbar.Header>
        <Appbar.Content title="Steam Inventory Value" />
      </Appbar.Header>

      <View style={styles.search}>
        <Searchbar
          placeholder="SteamID, profile link or custom URL"
          value={query}
          onChangeText={text => {
            setQuery(text);
            search.reset();
          }}
          onSubmitEditing={submit}
          onIconPress={submit}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          loading={search.isPending}
        />
        <HelperText type="error" visible={search.isError}>
          {search.error?.message}
        </HelperText>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        {favorites.length > 0 && (
          <List.Section>
            <List.Subheader>Favourites</List.Subheader>
            {favorites.map(profile => renderSaved(profile))}
          </List.Section>
        )}

        {recent.length > 0 && (
          <List.Section>
            <View style={styles.sectionHeader}>
              <List.Subheader style={styles.flex}>Recent searches</List.Subheader>
              <Button compact onPress={clearRecent} style={styles.clear}>Clear</Button>
            </View>
            {recent.map(profile => renderSaved(profile, () => removeRecent(profile.steamid)))}
          </List.Section>
        )}

        {favorites.length === 0 && recent.length === 0 && (
          <View style={styles.hint}>
            <Text variant="titleMedium">Look up any Steam inventory</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Paste a profile link (steamcommunity.com/id/… or /profiles/…), a 17-digit SteamID or a custom URL name.
              Profiles you open show up here, and you can star them to keep them at the top.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  search: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  content: {
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clear: {
    marginRight: 8,
  },
  hint: {
    padding: 24,
    gap: 8,
  },
});
