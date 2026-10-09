import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { Text } from '@/components/quiet/Text';
import { q } from '@/theme';

/**
 * The big inventory value. It counts up from zero when it first appears, and lives
 * in its own component so the per-frame updates don't re-render the item grid.
 */
export function CountingValue({ value, format }: { value: number; format: (usd: number) => string }) {
  const reduceMotion = useReducedMotion();
  const [ animated, setAnimated ] = useState(0);
  const frame = useRef(0);
  const shown = reduceMotion ? value : animated;

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1100);
      setAnimated(value * (1 - Math.pow(1 - p, 4)));
      if (p < 1) {
        frame.current = requestAnimationFrame(tick);
      }
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [ value, reduceMotion ]);

  const formatted = format(shown);
  // Split off the decimals so they can sit back in a fainter colour
  const match = /^(.*?)([.,]\d{1,2})(\D*)$/.exec(formatted);
  const whole = match ? match[1] : formatted;
  const fraction = match ? match[2] + match[3] : '';

  return (
    <Text size={56} weight="extralight" tracking={-0.055} tabular accessibilityLabel={format(value)} numberOfLines={1} adjustsFontSizeToFit>
      {whole}<Text size={56} weight="extralight" tracking={-0.055} color={q.faint}>{fraction}</Text>
    </Text>
  );
}
