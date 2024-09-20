import { StyleSheet, View } from 'react-native';
import { IFilterOptions, ISortOptions } from 'types';
import Text from './Text';
import { colors, templates } from '@styles/global';
import { Checkbox, Modal, Portal } from 'react-native-paper';
import { helpers } from '@utils/helpers';
import { useState } from 'react';

interface ISortFilterSheetProps {
  filter: IFilterOptions;
  sort: ISortOptions;
  setOptions: (newFilter: IFilterOptions, newSort: ISortOptions) => void;
  close: () => void;
}

export default function SortFilterSheet(props: ISortFilterSheetProps) {
  const [ filterOptions ] = useState(helpers.clone(props.filter));

  function changeFilterOption(opt: keyof IFilterOptions) {
    filterOptions[opt] = !filterOptions[opt];
  }

  return (
    <Portal>
      <Modal visible={true} onDismiss={() => props.close()}>
        <View style={styles.modal}>
          <Text bold style={styles.modalTitle}>Filters</Text>
          <View style={styles.optionsList}>
            <View style={styles.option}>
              <Checkbox status={filterOptions.nonMarketable ? 'checked' : 'unchecked'} onPress={() => changeFilterOption('nonMarketable')} />
              <Text>Non-marketable items</Text>
            </View>
          </View>

          <Text bold style={styles.modalTitle}>Sort</Text>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    width: '90%',
    height: '80%',
    backgroundColor: colors.background,
    margin: 'auto',
    borderRadius: helpers.resize(24),
    padding: helpers.resize(16),
  },
  modalTitle: {
    fontSize: helpers.resize(28),
  },
  optionsList: {
    ...templates.column,
    gap: helpers.resize(8),
    marginVertical: helpers.resize(12),
  },
  option: {
    ...templates.row,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: helpers.resize(16),
  },
});
