import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Dialog, List, Portal, RadioButton, SegmentedButtons, useTheme } from 'react-native-paper';

import { useProfiles } from '@/stores/profiles';
import { useSettings, type ThemeMode } from '@/stores/settings';
import { CURRENCIES } from '@/utils/currency';

export default function SettingsScreen() {
  const theme = useTheme();
  const { currency, setCurrency, themeMode, setThemeMode } = useSettings();
  const { recent, clearRecent } = useProfiles();
  const [ currencyDialog, setCurrencyDialog ] = useState(false);
  const currencyName = CURRENCIES.find(c => c.code === currency)?.name ?? currency;

  return (
    <View style={[ styles.flex, { backgroundColor: theme.colors.background } ]}>
      <Appbar.Header>
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <ScrollView>
        <List.Section>
          <List.Subheader>Display</List.Subheader>
          <List.Item
            title="Currency"
            description={`${currencyName} (${currency})`}
            left={({ style, color }) => <List.Icon style={style} color={color} icon="currency-usd" />}
            onPress={() => setCurrencyDialog(true)}
          />
          <List.Item
            title="Theme"
            left={({ style, color }) => <List.Icon style={style} color={color} icon="theme-light-dark" />}
          />
          <View style={styles.segmented}>
            <SegmentedButtons
              value={themeMode}
              onValueChange={value => setThemeMode(value as ThemeMode)}
              buttons={[
                { value: 'system', label: 'System' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
          </View>
        </List.Section>

        <List.Section>
          <List.Subheader>Data</List.Subheader>
          <List.Item
            title="Clear recent searches"
            description={recent.length ? `${recent.length} saved` : 'Nothing saved'}
            disabled={!recent.length}
            left={({ style, color }) => <List.Icon style={style} color={color} icon="history" />}
            onPress={clearRecent}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>About</List.Subheader>
          <List.Item
            title="Steam Inventory Value"
            description={`Version ${Constants.expoConfig?.version ?? '—'}`}
            left={({ style, color }) => <List.Icon style={style} color={color} icon="information-outline" />}
          />
          <List.Item
            title="Web version"
            description="linquint.dev"
            left={({ style, color }) => <List.Icon style={style} color={color} icon="web" />}
            onPress={() => WebBrowser.openBrowserAsync('https://linquint.dev')}
          />
        </List.Section>
      </ScrollView>

      <Portal>
        <Dialog visible={currencyDialog} onDismiss={() => setCurrencyDialog(false)} style={styles.dialog}>
          <Dialog.Title>Currency</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <ScrollView>
              <RadioButton.Group
                value={currency}
                onValueChange={code => {
                  setCurrency(code);
                  setCurrencyDialog(false);
                }}
              >
                {CURRENCIES.map(c => (
                  <RadioButton.Item key={c.code} value={c.code} label={`${c.name} (${c.code})`} position="leading" labelStyle={styles.radioLabel} />
                ))}
              </RadioButton.Group>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setCurrencyDialog(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  segmented: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  dialog: {
    maxHeight: '80%',
  },
  dialogScroll: {
    paddingHorizontal: 0,
  },
  radioLabel: {
    textAlign: 'left',
  },
});
