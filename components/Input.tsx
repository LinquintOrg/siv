import { Icon } from 'react-native-elements';
import { TextInput } from 'react-native-paper';
import { colors, global, variables } from 'styles/global';

interface IPropsInput {
  label: string;
  placeholder?: string;
  onChange: (text: string) => void;
  onSubmit: () => Promise<void>;
  icon: {
    name: string;
    type: string;
  };
}

export default function Input(props: IPropsInput) {
  return (
    <TextInput
      style={ global.input }
      placeholder={props.placeholder}
      mode={'outlined'}
      onChangeText={text => props.onChange(text)}
      onSubmitEditing={() => props.onSubmit()}
      label={props.label}
      activeOutlineColor={ colors.primary }
      left={
        <TextInput.Icon
          icon={() => (<Icon name={props.icon.name} type={props.icon.type} color={colors.primary} />)}
          size={variables.iconSize}
          style={ global.inputIcon }
          forceTextInputFocus={false}
        />
      }
      right={
        <TextInput.Icon
          icon={() => (<Icon name={'search'} type={'feather'} color={'#1F4690'} />)}
          size={ variables.iconLarge }
          style={ global.inputIcon }
          onPress={() => props.onSubmit()}
          forceTextInputFocus={false}
        />
      }
    />
  );
}
