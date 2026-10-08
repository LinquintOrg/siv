import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTheme } from 'react-native-paper';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <NativeTabs
      backgroundColor={theme.colors.elevation.level2}
      indicatorColor={theme.colors.secondaryContainer}
      iconColor={{ default: theme.colors.onSurfaceVariant, selected: theme.colors.onSecondaryContainer }}
      labelStyle={{ default: { color: theme.colors.onSurfaceVariant }, selected: { color: theme.colors.onSurface } }}
      rippleColor={theme.colors.onSurface + '1f'}
      labelVisibilityMode="labeled"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
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
        <NativeTabs.Trigger.Icon md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
