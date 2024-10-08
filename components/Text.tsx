import React, { ReactNode } from 'react';
import { StyleProp } from 'react-native';
import { Text, TextStyle } from 'react-native';

interface ITextProps {
  bold?: boolean;
  style?: StyleProp<TextStyle>;
  children: ReactNode;
}

export default function (props: ITextProps) {
  // TODO: Until Nunito is imported, use the default font, then switch to NunitoBold based on 'bold' prop
  // let font = { fontFamily: 'Nunito' };
  const { bold, style, children, ...newProps } = props;

  // ! until Nunito is imported, use the default font
  // if (bold) {
  //   font = { fontFamily: 'NunitoBold' };
  // }

  return (
    <Text {...newProps} style={[ style, bold ? { fontWeight: 'bold' } : {} ]}>
      {children}
    </Text>
  );
}
