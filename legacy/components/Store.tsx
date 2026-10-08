import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../styles/global';

export default function Store() {
  return (
    <StatusBar backgroundColor={colors.background} translucent={false} style={'dark'} />
  );
}
