import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface Point {
  x: number; // timestamp
  y: number;
}

interface Props {
  points: Point[];
  height?: number;
  formatValue: (value: number) => string;
}

/** Minimal area chart for a value over time. Expects points sorted by x. */
export function ValueChart({ points, height = 120, formatValue }: Props) {
  const theme = useTheme();
  const [ width, setWidth ] = useState(0);

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const pad = 4;

  const scaleX = (x: number) => maxX === minX ? width / 2 : ((x - minX) / (maxX - minX)) * width;
  const scaleY = (y: number) => maxY === minY ? height / 2 : pad + (1 - (y - minY) / (maxY - minY)) * (height - pad * 2);

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${scaleX(p.x).toFixed(1)},${scaleY(p.y).toFixed(1)}`).join(' ');
  const area = `${line} L${scaleX(maxX).toFixed(1)},${height} L${scaleX(minX).toFixed(1)},${height} Z`;

  const dateLabel = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <View>
      <Text variant="labelSmall" style={[ styles.range, { color: theme.colors.onSurfaceVariant } ]}>
        {`Low ${formatValue(minY)} · High ${formatValue(maxY)}`}
      </Text>
      <View style={{ height }} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={theme.colors.primary} stopOpacity={0.3} />
                <Stop offset="1" stopColor={theme.colors.primary} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path d={area} fill="url(#fill)" />
            <Path d={line} stroke={theme.colors.primary} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          </Svg>
        )}
      </View>
      <View style={styles.labels}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{dateLabel(minX)}</Text>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{dateLabel(maxX)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  range: {
    marginBottom: 8,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
});
