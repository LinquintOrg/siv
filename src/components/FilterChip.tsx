import type { ReactNode } from 'react';
import { Chip } from 'react-native-paper';

interface Props {
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
}

/** Material 3 filter chip: outlined when off, tonal with a check mark when on. */
export function FilterChip({ selected, onPress, children }: Props) {
  return (
    <Chip mode={selected ? 'flat' : 'outlined'} selected={selected} showSelectedCheck onPress={onPress}>
      {children}
    </Chip>
  );
}
