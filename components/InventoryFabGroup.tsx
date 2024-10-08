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
          colors: {
            primary: colors.primary,
            primaryContainer: colors.primary,
            onPrimary: colors.text,
            onPrimaryContainer: colors.text,
            background: colors.background,
          },
        }}
        actions={[
          {
            icon: 'filter-variant',
            label: 'Filter and sort',
            color: colors.primary,
            labelTextColor: colors.text,
            containerStyle: { backgroundColor: colors.primary },
            onPress: () => props.expand(),
          },
          {
            icon: 'information-outline',
            label: 'Summary',
            color: colors.primary,
            labelTextColor: colors.text,
            containerStyle: { backgroundColor: colors.primary },
            onPress: () => navigateToSummary(),
          },
        ]}
        onStateChange={onStateChange}
        onPress={() => {
          if (open) {
          // do something if the speed dial is open
          }
        }}
      />
    </Portal>
  );
}
