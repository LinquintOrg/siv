import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ILoaderProps } from '../utils/types';
import { styles, colors } from '../styles/global';
import Text from '../Elements/text';

export default function Loader(props: ILoaderProps) {
  return (
    <View style={ styles.loader.container }>
      <ActivityIndicator size="small" color={ colors.primary } />
      { props.text && <Text bold style={ styles.loader.text }>{ props.text }</Text> }
    </View>
  );
}
