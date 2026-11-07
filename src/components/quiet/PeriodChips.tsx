import { Pressable, View } from 'react-native';

import { Text } from '@/components/quiet/Text';
import { makeStyles, useQ } from '@/theme';

/** A choice of period for a chart: a row of chips, the chosen one outlined */
export function PeriodChips<T extends string>({ options, value, onChange, label }: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** What the periods are of, for screen readers */
  label: string;
}) {
  const q = useQ();
  const styles = useStyles();
  return (
    <View style={styles.row} accessibilityLabel={label}>
      {options.map(option => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            hitSlop={4}
            style={({ pressed }) => [ styles.chip, { borderColor: selected ? q.text : q.line3, opacity: pressed ? 0.7 : 1 } ]}
          >
            <Text size={13} tabular color={selected ? q.text : q.muted}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(() => ({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
}));
