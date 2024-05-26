import { View } from 'react-native';
import { Icon } from 'react-native-elements';
import { TextInput } from 'react-native-paper';
import { colors, global, variables } from 'styles/global';

export default function HomePage() {
  return (
    <>
      <View style={global.inputView}>
        <TextInput
          style={ global.input }
          placeholder='Enter SteamID64'
          mode={'outlined'}
          onChangeText={text => setSteamIDtyped(text)}
          onSubmitEditing={() => void getProfileData()}
          label={'Steam ID64'}
          activeOutlineColor={ colors.primary }
          left={
            <TextInput.Icon
              icon={() => (<Icon name={'at-sign'} type={'feather'} color={colors.primary} />)}
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
              onPress={() => void getProfileData() }
              forceTextInputFocus={false}
            />
          }
        />
      </View>
    </>
  );
}
