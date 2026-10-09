import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import type { InventoryHistoryEntry } from '@/api/types';
import { Text } from '@/components/quiet/Text';
import { q } from '@/theme';

const HEIGHT = 112;
const PAD = 6;

const shortDate = (iso: string | number) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/** Thin line of inventory value or item count over time. Drag across it to read a point. */
export function HistoryChart({ history, formatPrice }: { history: InventoryHistoryEntry[]; formatPrice: (usd: number) => string }) {
  const [ width, setWidth ] = useState(0);
  const [ mode, setMode ] = useState<'value' | 'items'>('value');
  const [ scrub, setScrub ] = useState<number | null>(null);

  const points = [ ...history ]
    .map(h => ({ t: new Date(h.searchedAt).getTime(), value: h.inventoryValue, items: h.itemCount }))
    .sort((a, b) => a.t - b.t);
  if (points.length < 2) {
    return null;
  }

  const series = points.map(p => (mode === 'value' ? p.value : p.items));
  const min = Math.min(...series);
  const max = Math.max(...series);
  const x = (i: number) => (i / (points.length - 1)) * width;
  const y = (v: number) => (max === min ? HEIGHT / 2 : PAD + (1 - (v - min) / (max - min)) * (HEIGHT - PAD * 2));
  const line = series.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  const pick = (locationX: number) => {
    if (width > 0) {
      setScrub(Math.max(0, Math.min(points.length - 1, Math.round((locationX / width) * (points.length - 1)))));
    }
  };

  const active = scrub !== null ? points[scrub] : null;
  const readout = active
    ? `${shortDate(active.t)} · ${mode === 'value' ? formatPrice(active.value) : `${active.items.toLocaleString('en-US')} items`}`
    : `Since ${shortDate(points[0].t)}`;

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Text size={12} color={q.faint} tabular>{readout}</Text>
        <View style={styles.modes}>
          {([ [ 'value', 'Value' ], [ 'items', 'Items' ] ] as const).map(([ key, label ]) => (
            <Pressable key={key} onPress={() => setMode(key)} hitSlop={8} accessibilityRole="button" accessibilityState={{ selected: mode === key }}>
              <Text size={12} color={mode === key ? q.text : q.dim}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View
        style={{ height: HEIGHT }}
        onLayout={e => setWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={e => pick(e.nativeEvent.locationX)}
        onResponderMove={e => pick(e.nativeEvent.locationX)}
        onResponderRelease={() => setScrub(null)}
        onResponderTerminate={() => setScrub(null)}
        accessibilityRole="image"
        accessibilityLabel={`Inventory ${mode} from ${shortDate(points[0].t)} to ${shortDate(points[points.length - 1].t)}`}
      >
        {width > 0 && (
          <Svg width={width} height={HEIGHT}>
            <Polyline points={line} fill="none" stroke={q.accent} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
          </Svg>
        )}
        {scrub !== null && width > 0 ? (
          <>
            <View pointerEvents="none" style={[ styles.hairline, { left: x(scrub) } ]} />
            <View pointerEvents="none" style={[ styles.dot, { left: x(scrub) - 4.5, top: y(series[scrub]) - 4.5 } ]} />
          </>
        ) : null}
      </View>
      <View style={styles.dates}>
        <Text size={11} color={q.faint}>{shortDate(points[0].t)}</Text>
        <Text size={11} color={q.faint}>{shortDate(points[points.length - 1].t)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modes: {
    flexDirection: 'row',
    gap: 16,
  },
  hairline: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: q.line3,
  },
  dot: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: q.accent,
    backgroundColor: q.bg,
  },
  dates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
