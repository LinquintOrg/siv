import { View } from 'react-native';

import { Text } from '@/components/quiet/Text';
import { makeStyles, useQ } from '@/theme';

/** CS2 wear ranges on the 0–1 float scale */
const BANDS = [
  { label: 'FN', start: 0, end: 0.07 },
  { label: 'MW', start: 0.07, end: 0.15 },
  { label: 'FT', start: 0.15, end: 0.38 },
  { label: 'WW', start: 0.38, end: 0.45 },
  { label: 'BS', start: 0.45, end: 1 },
];

/**
 * Where a float sits among the wears, and with `range`, among the floats the skin can have (floats are spread evenly
 * over its range, so the share above it is how rare a lower float is)
 */
export function FloatBar({ float, condition, range }: { float: number; condition?: string; range?: { min: number; max: number } }) {
  const q = useQ();
  const styles = useStyles();
  const active = BANDS.find(b => float < b.end) ?? BANDS[BANDS.length - 1];
  const shareAbove = range && range.max > range.min
    ? Math.round(Math.min(1, Math.max(0, (range.max - float) / (range.max - range.min))) * 100)
    : null;
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
        {range ? (
          <View style={[ styles.range, { left: `${range.min * 100}%`, width: `${Math.max(0.5, (range.max - range.min) * 100)}%` } ]} />
        ) : null}
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
      {range ? (
        <Text size={12} color={q.dim} tabular>
          Range {range.min.toFixed(2)} – {range.max.toFixed(2)}
          {shareAbove !== null ? ` · lower than ${shareAbove}% of the floats it can have` : ''}
        </Text>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(q => ({
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
  // The floats the skin can have, just under the bands
  range: {
    position: 'absolute',
    top: 5,
    height: 1,
    backgroundColor: q.soft,
  },
  marker: {
    position: 'absolute',
    top: -5,
    width: 2,
    height: 12,
    marginLeft: -1,
    backgroundColor: q.bright,
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
}));
