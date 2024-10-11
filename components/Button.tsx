import { helpers } from '@utils/helpers';
import { Pressable, StyleProp, TextStyle, ViewStyle } from 'react-native';
import Icon, { IconType } from 'react-native-elements/dist/icons/Icon';
import { global, templates, variables } from 'styles/global';
import Text from './Text';
import { Button as PaperButton } from 'react-native-paper';

interface IPropsButton {
  text: string;
  icon?: { name: string; type: IconType }
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  textBold?: boolean;
  onPress: () => void | Promise<void>,
}

export default function Button(props: IPropsButton) {
  return (
    <PaperButton
      mode='contained'
      style={[
        props.style,
        templates.row,
        templates.alignCenter,
        templates.justifyCenter,
        { minHeight: helpers.resize(40) },
      ]}
      compact={false}
      onPress={props.onPress}
    >
      <Text bold={props.textBold} style={[ { fontSize: helpers.resize(16) }, props.textStyle ]}>
        { props.text }
      </Text>
    </PaperButton>
    // <Pressable style={[ templates.button, templates.row, props.style ]} onPress={props.onPress}>
    //   { props.icon && <Icon name={props.icon.name} type={props.icon.type} size={helpers.resize(variables.iconSize)} /> }
    //   <Text bold={props.textBold} style={[ global.buttonText ]}>
    //     { props.text }
    //   </Text>
    // </Pressable>
  );
}
