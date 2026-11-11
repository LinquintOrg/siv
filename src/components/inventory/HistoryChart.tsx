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

/** Another money line on the value's scale, e.g. a marketplace's prices. Drawn when it has two points in the period */
export interface CompareLine {
  label: string;
  points: { t: number; value: number }[];
}

// How far a comparison's point may be from the one being read to show with it
const COMPARE_NEAR_MS = 36 * 60 * 60 * 1000;

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
export function HistoryChart({ points: unsorted, formatPrice, labels = INVENTORY, color: colorProp, countColor: countColorProp, compare = [] }: {
  points: HistoryPoint[];
  formatPrice: (usd: number) => string;
  labels?: Labels;
  color?: string;
  countColor?: string;
  /** More money lines on the value's scale, so the gaps between them show */
  compare?: CompareLine[];
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
  // Each comparison's points inside the value line's period, so they share the x axis
  const lines = compare
    .map(line => ({
      ...line,
      points: line.points.filter(p => p.t >= points[0].t && p.t <= points[points.length - 1].t).sort((a, b) => a.t - b.t),
    }))
    .filter(line => line.points.length >= 2);
  const valueY = scale([ ...points.map(p => p.value), ...lines.flatMap(line => line.points.map(p => p.value)) ]);
  const xOf = (t: number) => ((t - points[0].t) / span) * width;
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
  // Each comparison's nearest point to the one being read, when it's close enough
  const nearest = (line: CompareLine) => {
    if (!active) {
      return null;
    }
    const best = line.points.reduce((a, b) => (Math.abs(b.t - active.t) < Math.abs(a.t - active.t) ? b : a));
    return Math.abs(best.t - active.t) <= COMPARE_NEAR_MS ? best : null;
  };
  const compareReadout = lines.map(line => [ line, nearest(line) ] as const).filter(([ , p ]) => p);
  const readout = active
    ? [
      shortDate(active.t),
      formatPrice(active.value),
      ...compareReadout.map(([ line, p ]) => `${line.label} ${formatPrice(p!.value)}`),
      countLabel(active.count),
    ].join(' · ')
    : `Since ${shortDate(points[0].t)}`;
  const lineColor = (i: number) => (i === 0 ? q.soft : q.muted);
  const dashed = (i: number) => i % 2 === 1;
  const first = points[0];
  const last = points[points.length - 1];
  const description = `${labels.valueName} from ${formatPrice(first.value)} on ${shortDate(first.t)} to ${formatPrice(last.value)} on ${shortDate(last.t)}. `
    + lines.map(line => `${line.label} from ${formatPrice(line.points[0].value)} to ${formatPrice(line.points[line.points.length - 1].value)}. `).join('')
    + `${labels.countName} from ${countLabel(first.count)} to ${countLabel(last.count)}.`;

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Text size={12} color={q.faint} tabular style={styles.readout} numberOfLines={1}>{readout}</Text>
        {/* Hidden while reading a point, which needs the whole row on a phone */}
        {active ? null : (
          <View style={styles.legend} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {[
              { label: labels.value, swatch: color, dash: false },
              ...lines.map((line, i) => ({ label: line.label, swatch: lineColor(i), dash: dashed(i) })),
              { label: labels.count, swatch: countColor, dash: false },
            ].map(({ label, swatch, dash }) => (
              <View key={label} style={styles.legendItem}>
                {dash ? (
                  <View style={styles.swatchDashed}>
                    <View style={[ styles.swatchDash, { backgroundColor: swatch } ]} />
                    <View style={[ styles.swatchDash, { backgroundColor: swatch } ]} />
                  </View>
                ) : <View style={[ styles.swatch, { backgroundColor: swatch } ]} />}
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
              {lines.map((line, i) => (
                <Polyline
                  key={line.label}
                  points={line.points.map(p => `${xOf(p.t).toFixed(1)},${valueY(p.value).toFixed(1)}`).join(' ')}
                  fill="none"
                  stroke={lineColor(i)}
                  strokeWidth={1}
                  strokeDasharray={dashed(i) ? '4 3' : undefined}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    rowGap: 6,
  },
  readout: {
    flexShrink: 1,
    marginRight: 12,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 14,
    rowGap: 4,
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
  swatchDashed: {
    width: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  swatchDash: {
    width: 5,
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
