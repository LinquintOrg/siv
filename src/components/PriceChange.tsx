import { Text } from 'react-native-paper';
import type { TextProps } from 'react-native-paper';

import { useAppTheme } from '@/hooks/useAppTheme';

type Props = Omit<TextProps<never>, 'children'> & {
  percent: number | null;
};

export function PriceChange({ percent, style, ...rest }: Props) {
  const theme = useAppTheme();
  if (percent === null || !Number.isFinite(percent)) {
    return <Text {...rest} style={[ style, { color: theme.colors.onSurfaceVariant } ]}>—</Text>;
  }
  const color = percent > 0 ? theme.colors.positive : percent < 0 ? theme.colors.negative : theme.colors.onSurfaceVariant;
  const sign = percent > 0 ? '+' : '';
  return <Text {...rest} style={[ style, { color } ]}>{`${sign}${percent.toFixed(1)}%`}</Text>;
}
