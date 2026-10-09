import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Row, SectionTitle } from '@/components/quiet/Controls';
import { TabScreen } from '@/components/quiet/Screen';
import { OptionSheet } from '@/components/quiet/Sheet';
import { Text } from '@/components/quiet/Text';
import { useToast } from '@/components/quiet/Toaster';
import { useProfiles } from '@/stores/profiles';
import { useSettings } from '@/stores/settings';
import { GUTTER, q } from '@/theme';
import { CURRENCIES } from '@/utils/currency';

export default function SettingsScreen() {
  const { currency, setCurrency } = useSettings();
  const { recent, clearRecent } = useProfiles();
  const showToast = useToast(state => state.show);
  const [ picking, setPicking ] = useState(false);
  const [ confirming, setConfirming ] = useState(false);
  const currencyName = CURRENCIES.find(c => c.code === currency)?.name ?? currency;
  const recentLabel = recent.length ? `${recent.length} ${recent.length === 1 ? 'lookup' : 'lookups'}` : 'Nothing saved';

  const clear = () => {
    const before = useProfiles.getState().recent;
    clearRecent();
    setConfirming(false);
    showToast('Recent lookups cleared', { label: 'Undo', onPress: () => useProfiles.setState({ recent: before }) });
  };

  return (
    <TabScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(450)}>
          <Text size={44} weight="extralight" tracking={-0.045}>Settings</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(50)} style={styles.section}>
          <SectionTitle>Display</SectionTitle>
          <Row onPress={() => setPicking(true)} accessibilityLabel={`Currency, ${currencyName}`}>
            <Text size={16} style={styles.flex}>Currency</Text>
            <Text size={14} color={q.muted}>{currencyName} · <Text size={12} mono color={q.muted}>{currency}</Text></Text>
            <Feather name="arrow-right" size={16} color={q.faint} />
          </Row>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(100)} style={styles.section}>
          <SectionTitle>Data</SectionTitle>
          {confirming ? (
            <Animated.View entering={FadeIn.duration(200)}>
              <Row>
                <Text size={16} style={styles.flex}>Clear {recentLabel}?</Text>
                <Pressable onPress={clear} style={styles.confirm} accessibilityRole="button">
                  <Text size={15} color={q.danger}>Clear</Text>
                </Pressable>
                <Pressable onPress={() => setConfirming(false)} style={styles.confirm} accessibilityRole="button">
                  <Text size={15} color={q.muted}>Keep</Text>
                </Pressable>
              </Row>
            </Animated.View>
          ) : (
            <Row onPress={recent.length ? () => setConfirming(true) : undefined}>
              <Text size={16} color={recent.length ? q.text : q.faint} style={styles.flex}>Clear recent lookups</Text>
              <Text size={14} color={q.dim} tabular>{recentLabel}</Text>
            </Row>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(150)} style={styles.section}>
          <SectionTitle>About</SectionTitle>
          <Row>
            <Text size={16} style={styles.flex}>Steam Inventory Value</Text>
            <Text size={12} mono color={q.dim}>{Constants.expoConfig?.version ?? '—'}</Text>
          </Row>
          <Row onPress={() => WebBrowser.openBrowserAsync('https://linquint.dev')} accessibilityLabel="Web version, linquint.dev">
            <Text size={16} style={styles.flex}>Web version</Text>
            <Text size={14} color={q.muted}>linquint.dev ↗</Text>
          </Row>
          <Row onPress={() => WebBrowser.openBrowserAsync('https://linquint.dev/changelogs')} accessibilityLabel="What's new, changelog">
            <Text size={16} style={styles.flex}>What&apos;s new</Text>
            <Text size={14} color={q.muted}>Changelog ↗</Text>
          </Row>
          <Text size={13} color={q.dim} leading={1.6} style={styles.note}>Prices come from the Steam Community Market.</Text>
        </Animated.View>
      </ScrollView>

      <OptionSheet
        open={picking}
        onClose={() => setPicking(false)}
        kicker="Prices shown in"
        title="Currency"
        searchPlaceholder="Search currencies"
        options={CURRENCIES.map(c => ({ value: c.code as string, label: c.name, sub: c.code }))}
        selected={currency}
        onSelect={code => {
          setCurrency(code);
          setPicking(false);
          showToast(`Prices now in ${CURRENCIES.find(c => c.code === code)?.name ?? code}`);
        }}
      />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: GUTTER,
    paddingTop: 56,
    paddingBottom: 40,
  },
  flex: {
    flex: 1,
  },
  section: {
    marginTop: 36,
  },
  confirm: {
    height: 44,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  note: {
    marginTop: 18,
  },
});
