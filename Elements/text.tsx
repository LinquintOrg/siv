import React from 'react';
import { Text } from 'react-native';
import { ITextProps } from '../utils/types';

export default function (props: ITextProps) {
  // ! until Nunito is imported, use the default font
  // let font = { fontFamily: 'Nunito' };
  const { bold, style, children, ...newProps } = props;

  // ! until Nunito is imported, use the default font
  // if (bold) {
  //   font = { fontFamily: 'NunitoBold' };
  // }

  return (
    <Text {...newProps} style={[ style/*, font*/ ]}>
      {children}
    </Text>
  );
}
