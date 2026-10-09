import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/quiet/Text';
import { q } from '@/theme';

/** CS2 wear ranges on the 0–1 float scale */
const BANDS = [
  { label: 'FN', start: 0, end: 0.07 },
  { label: 'MW', start: 0.07, end: 0.15 },
  { label: 'FT', start: 0.15, end: 0.38 },
  { label: 'WW', start: 0.38, end: 0.45 },
  { label: 'BS', start: 0.45, end: 1 },
];

export function FloatBar({ float, condition }: { float: number; condition?: string }) {
  const active = BANDS.find(b => float < b.end) ?? BANDS[BANDS.length - 1];
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text size={13} color={q.muted}>Float · {condition || active.label}</Text>
        <Text size={13} mono tabular>{float.toFixed(6)}</Text>
      </View>
      <View style={styles.track}>
        {BANDS.map(b => (
          <View
            key={b.label}
            style={[ styles.band, { left: `${b.start * 100}%`, width: `${(b.end - b.start) * 100}%`, backgroundColor: b === active ? q.muted : q.line3 } ]}
          />
        ))}
        <View style={[ styles.marker, { left: `${Math.min(100, float * 100)}%` } ]} />
      </View>
      <View style={styles.labels} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {BANDS.map(b => (
          // Each label is centred under its band
          <View key={b.label} style={[ styles.labelSlot, { left: `${b.start * 100}%`, width: `${(b.end - b.start) * 100}%` } ]}>
            <Text size={10} mono color={b === active ? q.soft : q.faint}>{b.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    height: 2,
  },
  band: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    // Gap between bands
    borderRightWidth: 2,
    borderRightColor: q.bg,
  },
  marker: {
    position: 'absolute',
    top: -5,
    width: 2,
    height: 12,
    marginLeft: -1,
    backgroundColor: q.white,
  },
  labels: {
    height: 14,
  },
  labelSlot: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    // FN is narrow; let its label overflow the slot instead of wrapping
    overflow: 'visible',
  },
});
