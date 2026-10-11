import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Polyline } from 'react-native-svg';

import { Text } from '@/components/quiet/Text';
import { q } from '@/theme';

const HEIGHT = 112;
const PAD = 6;
const HOLD_MS = 180;

const shortDate = (iso: string | number) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export interface HistoryPoint {
  t: number;
  value: number;
  count: number;
}

interface Labels {
  value: string;
  count: string;
  countUnit: string;
  valueName: string;
  countName: string;
}

const INVENTORY: Labels = { value: 'Value', count: 'Items', countUnit: 'items', valueName: 'Inventory value', countName: 'Item count' };

/** Thin line of a money value or a count over time. Hold or drag sideways across it to read a point. */
export function HistoryChart({ points: unsorted, formatPrice, labels = INVENTORY, color = q.accent }: {
  points: HistoryPoint[];
  formatPrice: (usd: number) => string;
  labels?: Labels;
  color?: string;
}) {
  const [ width, setWidth ] = useState(0);
  const [ mode, setMode ] = useState<'value' | 'items'>('value');
  const [ scrub, setScrub ] = useState<number | null>(null);

  const points = [ ...unsorted ].sort((a, b) => a.t - b.t);
  if (points.length < 2) {
    return null;
  }

  const series = points.map(p => (mode === 'value' ? p.value : p.count));
  const min = Math.min(...series);
  const max = Math.max(...series);
  // Spaced by time, so missing days show as longer segments
  const span = points[points.length - 1].t - points[0].t || 1;
  const x = (i: number) => ((points[i].t - points[0].t) / span) * width;
  const y = (v: number) => (max === min ? HEIGHT / 2 : PAD + (1 - (v - min) / (max - min)) * (HEIGHT - PAD * 2));
  const line = series.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  const pick = (locationX: number) => {
    if (width > 0) {
      let nearest = 0;
      points.forEach((_, i) => {
        if (Math.abs(x(i) - locationX) < Math.abs(x(nearest) - locationX)) {
          nearest = i;
        }
      });
      setScrub(nearest);
    }
  };

  // Once either gesture activates it owns the touch, so the page stops scrolling until the finger lifts.
  // A vertical swipe that starts on the chart fails both and scrolls the page as usual.
  const hold = Gesture.Pan()
    .runOnJS(true)
    .activateAfterLongPress(HOLD_MS)
    .onStart(e => {
      Haptics.selectionAsync();
      pick(e.x);
    })
    .onUpdate(e => pick(e.x))
    .onFinalize(() => setScrub(null));
  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([ -8, 8 ])
    .failOffsetY([ -8, 8 ])
    .onStart(e => pick(e.x))
    .onUpdate(e => pick(e.x))
    .onFinalize(() => setScrub(null));
  const scrubbing = Gesture.Race(hold, swipe);

  const active = scrub !== null ? points[scrub] : null;
  const readout = active
    ? `${shortDate(active.t)} · ${mode === 'value' ? formatPrice(active.value) : `${active.count.toLocaleString('en-US')} ${labels.countUnit}`}`
    : `Since ${shortDate(points[0].t)}`;
  const description = `${mode === 'value' ? labels.valueName : labels.countName} from ${shortDate(points[0].t)} to ${shortDate(points[points.length - 1].t)}`;

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Text size={12} color={q.faint} tabular>{readout}</Text>
        <View style={styles.modes}>
          {([ [ 'value', labels.value ], [ 'items', labels.count ] ] as const).map(([ key, label ]) => (
            <Pressable key={key} onPress={() => setMode(key)} hitSlop={8} accessibilityRole="button" accessibilityState={{ selected: mode === key }}>
              <Text size={12} color={mode === key ? q.text : q.dim}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <GestureDetector gesture={scrubbing}>
        <View
          style={{ height: HEIGHT }}
          onLayout={e => setWidth(e.nativeEvent.layout.width)}
          accessibilityRole="image"
          accessibilityLabel={description}
        >
          {width > 0 && (
            <Svg width={width} height={HEIGHT}>
              <Polyline points={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
            </Svg>
          )}
          {scrub !== null && width > 0 ? (
            <>
              <View pointerEvents="none" style={[ styles.hairline, { left: x(scrub) } ]} />
              <View
                pointerEvents="none"
                style={[ styles.dot, { borderColor: color, left: x(scrub) - 4.5, top: y(series[scrub]) - 4.5 } ]}
              />
            </>
          ) : null}
        </View>
      </GestureDetector>
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
