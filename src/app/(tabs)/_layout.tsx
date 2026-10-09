import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { fonts, q } from '@/theme';

export default function TabsLayout() {
  return (
    <NativeTabs
      backgroundColor={q.bg}
      indicatorColor={q.line2}
      iconColor={{ default: q.dim, selected: q.text }}
      labelStyle={{
        default: { color: q.dim, fontFamily: fonts.regular, fontSize: 11 },
        selected: { color: q.text, fontFamily: fonts.regular, fontSize: 11 },
      }}
      rippleColor="#FFFFFF14"
      labelVisibilityMode="labeled"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Inventory</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="search" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="leaderboard">
        <NativeTabs.Trigger.Label>Leaderboard</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="leaderboard" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="music-kits">
        <NativeTabs.Trigger.Label>Music kits</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="library_music" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="tune" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
