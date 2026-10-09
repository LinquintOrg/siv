import { Feather } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { api } from '@/api/client';
import { queryKeys } from '@/api/queries';
import type { SteamProfile } from '@/api/types';
import { Avatar, Pill, SectionTitle, UnderlineInput } from '@/components/quiet/Controls';
import { TabScreen } from '@/components/quiet/Screen';
import { Text } from '@/components/quiet/Text';
import { useToast } from '@/components/quiet/Toaster';
import { useProfiles, type SavedProfile } from '@/stores/profiles';
import { GUTTER, q } from '@/theme';

const STEPS = [
  { title: 'Paste a profile', body: 'A steamcommunity.com link, a 17-digit SteamID or a custom URL name.' },
  { title: 'Pick a game', body: 'Every game with a Community Market inventory is supported.' },
  { title: 'See every item, priced', body: 'Profiles you open land here. Star them to keep them at the top.' },
];

export default function SearchScreen() {
  const queryClient = useQueryClient();
  const showToast = useToast(state => state.show);
  const [ query, setQuery ] = useState('');
  const [ localError, setLocalError ] = useState<string | null>(null);
  const { favorites, recent, addRecent, removeRecent, clearRecent } = useProfiles();
  const shake = useSharedValue(0);

  const search = useMutation({
    mutationFn: (input: string) => api.searchProfile(input),
    onSuccess: (profile: SteamProfile) => {
      queryClient.setQueryData(queryKeys.profile(profile.steamid), profile);
      addRecent(profile);
      setQuery('');
      openProfile(profile.steamid);
    },
  });

  const error = localError ?? (search.isError ? search.error.message : null);

  useEffect(() => {
    if (error) {
      shake.value = withSequence(withTiming(-6, { duration: 45 }), withRepeat(withTiming(6, { duration: 90 }), 3, true), withTiming(0, { duration: 45 }));
    }
  }, [ error, shake ]);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [ { translateX: shake.value } ] }));

  const submit = () => {
    const input = query.trim();
    if (!input) {
      setLocalError('Enter a profile link, SteamID64 or custom URL.');
      return;
    }
    if (!search.isPending) {
      Keyboard.dismiss();
      search.mutate(input);
    }
  };

  const openProfile = (steamid: string) => router.push({ pathname: '/profile/[steamid]', params: { steamid } });

  const removeRecentProfile = (profile: SavedProfile) => {
    const before = useProfiles.getState().recent;
    removeRecent(profile.steamid);
    showToast(`Removed ${profile.name}`, { label: 'Undo', onPress: () => useProfiles.setState({ recent: before }) });
  };

  const clearAll = () => {
    const before = useProfiles.getState().recent;
    clearRecent();
    showToast('Recent lookups cleared', { label: 'Undo', onPress: () => useProfiles.setState({ recent: before }) });
  };

  return (
    <TabScreen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.hero}>
          <Text size={13} color={q.muted}>Inventory lookup</Text>
          <Text size={42} weight="extralight" tracking={-0.045} leading={1.05}>
            {'What\'s your\n'}<Text size={42} weight="extralight" tracking={-0.045} color={q.dim}>inventory worth?</Text>
          </Text>
        </Animated.View>

        <Animated.View style={[ styles.form, shakeStyle ]}>
          <View>
            <UnderlineInput
              size={22}
              value={query}
              onChangeText={text => {
                setQuery(text);
                setLocalError(null);
                search.reset();
              }}
              onSubmitEditing={submit}
              returnKeyType="search"
              placeholder="steamcommunity.com/id/…"
              accessibilityLabel="Steam profile link, SteamID64 or custom URL"
              invalid={!!error}
              editable={!search.isPending}
            />
            {search.isPending ? <LoadingBar /> : null}
          </View>
          {error ? (
            <Animated.View entering={FadeIn.duration(200)}>
              <Text size={14} color={q.danger} accessibilityRole="alert">{error}</Text>
            </Animated.View>
          ) : null}
          <View style={styles.actions}>
            <Pill label={search.isPending ? 'Looking up…' : 'Look up'} icon={search.isPending ? undefined : 'arrow-right'} onPress={submit} />
            <Text size={12} color={q.dim} leading={1.5} style={styles.flex}>SteamID64, custom URL or a full profile link.</Text>
          </View>
        </Animated.View>

        {favorites.length > 0 && (
          <View style={styles.section}>
            <SectionTitle>Favourites <Text size={13} color={q.faint} tabular>{favorites.length}</Text></SectionTitle>
            {favorites.map(profile => (
              <ProfileRow key={profile.steamid} profile={profile} detail={profile.steamid} mono onPress={() => openProfile(profile.steamid)} />
            ))}
          </View>
        )}

        {recent.length > 0 && (
          <View style={styles.section}>
            <SectionTitle right={<Pressable hitSlop={10} onPress={clearAll} accessibilityRole="button"><Text size={13} color={q.dim}>Clear</Text></Pressable>}>
              Recent
            </SectionTitle>
            {recent.map(profile => (
              <ProfileRow
                key={profile.steamid}
                profile={profile}
                detail={profile.steamid}
                mono
                onPress={() => openProfile(profile.steamid)}
                onRemove={() => removeRecentProfile(profile)}
              />
            ))}
          </View>
        )}

        {favorites.length === 0 && recent.length === 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(120)} style={styles.section}>
            <SectionTitle>How it works</SectionTitle>
            {STEPS.map((step, i) => (
              <View key={step.title} style={styles.step}>
                <Text size={11} mono color={q.accent} style={styles.stepNumber}>{String(i + 1).padStart(2, '0')}</Text>
                <View style={styles.stepText}>
                  <Text size={16}>{step.title}</Text>
                  <Text size={13} color={q.dim} leading={1.5}>{step.body}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </TabScreen>
  );
}

function ProfileRow({ profile, detail, mono, onPress, onRemove }: {
  profile: SavedProfile;
  detail: string;
  mono?: boolean;
  onPress: () => void;
  onRemove?: () => void;
}) {
  return (
    <View style={styles.profileRow}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [ styles.profileMain, pressed && { opacity: 0.6 } ]}
      >
        <Avatar uri={profile.avatar} name={profile.name} />
        <View style={styles.flex}>
          <Text size={16} numberOfLines={1}>{profile.name}</Text>
          <Text size={mono ? 11 : 12} mono={mono} color={q.dim} numberOfLines={1}>{detail}</Text>
        </View>
        {onRemove ? null : <Feather name="arrow-right" size={16} color={q.faint} />}
      </Pressable>
      {onRemove ? (
        <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Remove ${profile.name}`} style={styles.remove} hitSlop={4}>
          <Feather name="x" size={17} color={q.faint} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** Thin bar that sweeps under the input while a lookup runs. */
function LoadingBar() {
  const x = useSharedValue(0);
  useEffect(() => {
    x.value = withRepeat(withTiming(1, { duration: 1000 }), -1);
  }, [ x ]);
  const style = useAnimatedStyle(() => ({ left: `${x.value * 100}%`, width: `${Math.sin(x.value * Math.PI) * 50}%` }));
  return <Animated.View style={[ styles.loadingBar, style ]} />;
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: GUTTER,
    paddingTop: 28,
    paddingBottom: 48,
  },
  flex: {
    flex: 1,
  },
  hero: {
    gap: 10,
  },
  form: {
    marginTop: 30,
    gap: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  loadingBar: {
    position: 'absolute',
    bottom: 0,
    height: 1,
    backgroundColor: q.accent,
  },
  section: {
    marginTop: 48,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: q.line,
  },
  profileMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    paddingVertical: 10,
  },
  remove: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: q.line,
  },
  stepNumber: {
    paddingTop: 3,
  },
  stepText: {
    flex: 1,
    gap: 4,
  },
});
