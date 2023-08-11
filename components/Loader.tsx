import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ILoaderProps } from '../utils/types';
import { styles, colors } from '../styles/global';
import Text from './Text';

export default function Loader(props: ILoaderProps) {
  // TODO: Improve by adding more options for loader size and perhaps color

  return (
    <View style={ styles.loader.container }>
      <ActivityIndicator size="small" color={ colors.primary } />
      { props.text && <Text style={ styles.loader.text }>{ props.text }</Text> }
    </View>
  );
}
