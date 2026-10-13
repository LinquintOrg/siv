import { Text as RNText, type TextProps } from 'react-native';

import { fonts, useQ, type FontWeight } from '@/theme';

interface Props extends TextProps {
  size?: number;
  weight?: FontWeight;
  mono?: boolean;
  color?: string;
  /** Letter spacing in em, like the web's tracking utilities. */
  tracking?: number;
  /** Line height as a multiple of the font size. */
  leading?: number;
  /** Tabular figures so numbers don't jitter while they change. */
  tabular?: boolean;
  align?: 'left' | 'center' | 'right';
}

export function Text({ size = 15, weight = 'regular', mono, color, tracking, leading, tabular, align, style, ...rest }: Props) {
  const q = useQ();
  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: mono ? fonts.mono : fonts[weight],
          fontSize: size,
          color: color ?? q.text,
          letterSpacing: tracking ? tracking * size : undefined,
          lineHeight: leading ? Math.round(leading * size) : undefined,
          fontVariant: tabular ? [ 'tabular-nums' ] : undefined,
          textAlign: align,
        },
        style,
      ]}
    />
  );
}
