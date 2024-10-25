import { Portal, Dialog, Button, Divider } from 'react-native-paper';
import Text from './Text';
import { FlashList } from '@shopify/flash-list';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { templates, colors } from '@styles/global';
import { helpers } from '@utils/helpers';
import { Icon } from 'react-native-elements';

interface IDialogPickerProps {
  title: string;
  content: string;
  list: string[];
  select: (id: number) => void;
  close: () => void;
}

export default function DialogPicker(props: IDialogPickerProps) {
  const { title, content, list, select, close } = props;
  const [ selected, setSelected ] = useState(-1);

  const renderedList = useMemo(
    () => list.map((item, idx) => ({ title: item, marked: idx === selected })),
    [ list, selected ],
  );

  const renderItem = (item: {title: string; marked: boolean}, idx: number) => (
    <>
      <Pressable style={styles.selection} onPress={() => setSelected(idx)}>
        <Text style={{ fontSize: helpers.resize(16) }}>{ item.title }</Text>
        <Icon type='feather' name={item.marked && 'x-square' || 'square'} color={colors.primary} />
      </Pressable>
      { (idx < list.length - 1) && <Divider /> }
    </>
  );

  function onSelect() {
    if (selected === -1) {
      throw new Error('Select an item first');
    }
    select(selected);
  }

  return (
    <Portal>
      <Dialog visible={true} onDismiss={close}>
        <Dialog.Title>{ title || 'Title' }</Dialog.Title>
        {
          content &&
            <Dialog.Content>
              <Text style={{ fontSize: helpers.resize(14) }}>{ content }</Text>
            </Dialog.Content>
        }
        <View style={styles.listArea}>
          <FlashList
            data={renderedList}
            renderItem={({ item, index }) => renderItem(item, index)}
            estimatedItemSize={helpers.resize(36)}
          />
        </View>
        <Dialog.Actions>
          <Button labelStyle={{ fontSize: helpers.resize(16) }} onPress={close}>Cancel</Button>
          <Button labelStyle={{ fontSize: helpers.resize(16) }} onPress={onSelect}>Select</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  listArea: {
    minHeight: helpers.resize(240),
    maxHeight: helpers.resize(240),
    width: '90%',
    marginHorizontal: 'auto',
    marginBottom: helpers.resize(12),
  },
  selection: {
    ...templates.row,
    padding: helpers.resize(12),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
