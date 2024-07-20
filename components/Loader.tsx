import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { styles, colors } from '../styles/global';
import Text from './Text';

export interface ILoaderProps {
  text?: string;
  dir?: 'row' | 'column';
  size?: 'small' | 'large' | number;
}

export default function Loader(props: ILoaderProps) {
  // TODO: Improve by adding more options for loader size and perhaps color

  return (
    <View style={ styles.loader.container }>
      <ActivityIndicator
        size={props.size ? props.size : 'small'}
        color={ colors.primary }
      />
      { !!props.text && <Text style={ styles.loader.text }>{ props.text }</Text> }
    </View>
  );
}
