import { helpers } from '@utils/helpers';
import { Icon } from 'react-native-elements';
import { TextInput } from 'react-native-paper';
import { colors, global, variables } from 'styles/global';

interface IPropsInput {
  value: string;
  label: string;
  placeholder?: string;
  onChange: (text: string) => void;
  onSubmit?: () => Promise<void>;
  icon: {
    name: string;
    type: string;
  };
}

export default function Input(props: IPropsInput) {
  return (
    <TextInput
      style={{ marginBottom: helpers.resize(8) }}
      placeholder={props.placeholder}
      onChangeText={text => props.onChange(text)}
      onSubmitEditing={() => props.onSubmit ? props.onSubmit() : undefined}
      label={props.label}
      value={props.value}
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
          icon={() => (<Icon name={'search'} type={'feather'} color={colors.primary} />)}
          size={ variables.iconLarge }
          style={ global.inputIcon }
          onPress={() => props.onSubmit ? props.onSubmit() : undefined}
          forceTextInputFocus={false}
        />
      }
      theme={{
        roundness: helpers.resize(12),
      }}
    />
  );
}
