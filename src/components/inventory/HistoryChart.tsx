import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Polyline } from 'react-native-svg';

import { Text } from '@/components/quiet/Text';
import { makeStyles, useQ } from '@/theme';

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

/**
 * Thin lines of a money value and a count over time, each on its own scale.
 * Hold or drag sideways across it to read a point.
 */
export function HistoryChart({ points: unsorted, formatPrice, labels = INVENTORY, color: colorProp, countColor: countColorProp }: {
  points: HistoryPoint[];
  formatPrice: (usd: number) => string;
  labels?: Labels;
  color?: string;
  countColor?: string;
}) {
  const q = useQ();
  const styles = useStyles();
  const color = colorProp ?? q.accent;
  const countColor = countColorProp ?? q.gold;
  const [ width, setWidth ] = useState(0);
  const [ scrub, setScrub ] = useState<number | null>(null);

  const points = [ ...unsorted ].sort((a, b) => a.t - b.t);
  if (points.length < 2) {
    return null;
  }

  // Spaced by time, so missing days show as longer segments
  const span = points[points.length - 1].t - points[0].t || 1;
  const x = (i: number) => ((points[i].t - points[0].t) / span) * width;
  const scale = (series: number[]) => {
    const min = Math.min(...series);
    const max = Math.max(...series);
    return (v: number) => (max === min ? HEIGHT / 2 : PAD + (1 - (v - min) / (max - min)) * (HEIGHT - PAD * 2));
  };
  const valueY = scale(points.map(p => p.value));
  const countY = scale(points.map(p => p.count));
  const lineOf = (y: (v: number) => number, key: 'value' | 'count') =>
    points.map((p, i) => `${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ');

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
  const countLabel = (count: number) => `${count.toLocaleString('en-US')} ${labels.countUnit}`;
  const readout = active
    ? `${shortDate(active.t)} · ${formatPrice(active.value)} · ${countLabel(active.count)}`
    : `Since ${shortDate(points[0].t)}`;
  const first = points[0];
  const last = points[points.length - 1];
  const description = `${labels.valueName} from ${formatPrice(first.value)} on ${shortDate(first.t)} to ${formatPrice(last.value)} on ${shortDate(last.t)}. `
    + `${labels.countName} from ${countLabel(first.count)} to ${countLabel(last.count)}.`;

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Text size={12} color={q.faint} tabular style={styles.readout} numberOfLines={1}>{readout}</Text>
        {/* Hidden while reading a point, which needs the whole row on a phone */}
        {active ? null : (
          <View style={styles.legend} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {([ [ labels.value, color ], [ labels.count, countColor ] ] as const).map(([ label, swatch ]) => (
              <View key={label} style={styles.legendItem}>
                <View style={[ styles.swatch, { backgroundColor: swatch } ]} />
                <Text size={12} color={q.dim}>{label}</Text>
              </View>
            ))}
          </View>
        )}
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
              <Polyline
                points={lineOf(countY, 'count')}
                fill="none"
                stroke={countColor}
                strokeOpacity={0.85}
                strokeWidth={1}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <Polyline points={lineOf(valueY, 'value')} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
            </Svg>
          )}
          {scrub !== null && width > 0 ? (
            <>
              <View pointerEvents="none" style={[ styles.hairline, { left: x(scrub) } ]} />
              <View
                pointerEvents="none"
                style={[ styles.dot, { borderColor: countColor, left: x(scrub) - 4.5, top: countY(points[scrub].count) - 4.5 } ]}
              />
              <View
                pointerEvents="none"
                style={[ styles.dot, { borderColor: color, left: x(scrub) - 4.5, top: valueY(points[scrub].value) - 4.5 } ]}
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

const useStyles = makeStyles(q => ({
  wrap: {
    gap: 10,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readout: {
    flexShrink: 1,
    marginRight: 12,
  },
  legend: {
    flexDirection: 'row',
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 12,
    height: 2,
    borderRadius: 1,
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
}));
