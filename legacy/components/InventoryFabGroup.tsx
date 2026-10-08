import { colors } from '@styles/global';
import { helpers } from '@utils/helpers';
import { router } from 'expo-router';
import { useState } from 'react';
import { FAB, Portal } from 'react-native-paper';

export default function InventoryFabGroup(props: { expand: () => void }) {
  const [ state, setState ] = useState({ open: false });
  const onStateChange = ({ open }: { open: boolean }) => setState({ open });
  const { open } = state;

  function navigateToSummary() {
    router.navigate('/inventory/summary');
  }

  return (
    <Portal>
      <FAB.Group
        open={open}
        visible
        icon={'dots-vertical'}
        style={{ marginBottom: helpers.resize(70) }}
        theme={{
          roundness: helpers.resize(3),
          colors: {
            accent: colors.accent,
          },
        }}
        actions={[
          {
            icon: 'filter-variant',
            label: 'Filter and sort',
            style: { backgroundColor: colors.accent },
            onPress: () => props.expand(),
          },
          {
            icon: 'information-outline',
            label: 'Summary',
            style: { backgroundColor: colors.accent },
            onPress: () => navigateToSummary(),
          },
        ]}
        onStateChange={onStateChange}
      />
    </Portal>
  );
}
