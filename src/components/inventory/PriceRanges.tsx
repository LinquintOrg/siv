import { View } from 'react-native';

import type { PriceRangePeriod, PriceRanges as Ranges } from '@/api/types';
import { Text } from '@/components/quiet/Text';
import { makeStyles, useQ } from '@/theme';

const PERIODS: { period: PriceRangePeriod; label: string }[] = [
  { period: '7d', label: '7 days' },
  { period: '30d', label: '30 days' },
  { period: '90d', label: '90 days' },
  { period: '1y', label: '1 year' },
  { period: 'all', label: 'All time' },
];

/** Lowest and highest price per period, and how far the price moved since its start */
export function PriceRanges({ ranges, price, formatPrice }: {
  ranges: Ranges;
  /** The current price, which changes are measured to */
  price: number | null;
  formatPrice: (usd: number | null | undefined) => string;
}) {
  const q = useQ();
  const styles = useStyles();
  // Periods with nothing in them (an item tracked for a month has no year) are left out
  const rows = PERIODS
    .map(({ period, label }) => {
      const range = ranges[period];
      const change = range?.from && price !== null ? (price - range.from) / range.from : null;
      return { period, label, low: range?.low ?? null, high: range?.high ?? null, change };
    })
    .filter(row => row.low !== null || row.high !== null);

  return (
    <View>
      <View style={styles.row}>
        <Text size={12} color={q.dim} style={styles.label}>Period</Text>
        <Text size={12} color={q.dim} style={styles.num}>Low</Text>
        <Text size={12} color={q.dim} style={styles.num}>High</Text>
        <Text size={12} color={q.dim} style={styles.num}>Change</Text>
      </View>
      {rows.map(row => (
        <View
          key={row.period}
          style={[ styles.row, styles.line ]}
          accessible
          accessibilityLabel={[
            `${row.label}: low ${formatPrice(row.low)}`,
            `high ${formatPrice(row.high)}`,
            ...(row.change === null ? [] : [ changeLabel(row.change) ]),
          ].join(', ')}
        >
          <Text size={14} color={q.muted} style={styles.label}>{row.label}</Text>
          <Text size={14} tabular style={styles.num} numberOfLines={1} adjustsFontSizeToFit>{formatPrice(row.low)}</Text>
          <Text size={14} tabular style={styles.num} numberOfLines={1} adjustsFontSizeToFit>{formatPrice(row.high)}</Text>
          <Text
            size={14}
            tabular
            style={styles.num}
            color={row.change === null ? q.faint : row.change >= 0 ? q.accent : q.danger}
          >
            {row.change === null ? '—' : changeLabel(row.change)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const changeLabel = (change: number) => `${change >= 0 ? '+' : '−'}${Math.abs(change * 100).toFixed(1)}%`;

const useStyles = makeStyles(q => ({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    paddingVertical: 10,
  },
  line: {
    borderTopWidth: 1,
    borderTopColor: q.line2,
  },
  label: {
    flex: 1.1,
  },
  num: {
    flex: 1,
    textAlign: 'right',
  },
}));
