import React from 'react';
import {Text} from 'react-native';
import { ITextProps } from '../types';

export default function (props: ITextProps) {
  let font = { fontFamily: 'Nunito' };
  const { bold, style, children, ...newProps } = props;

  if (bold) {
    font = {fontFamily: 'NunitoBold'};
  }

  return (
    <Text {...newProps} style={[ style, font ]}>
      {children}
    </Text>
  );
}
