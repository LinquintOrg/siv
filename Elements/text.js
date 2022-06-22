import React from 'react';
import {Text} from "react-native";

export default function (props) {
    let font = { fontFamily: 'Nunito' }
    if (props.bold) {
        font = {fontFamily: 'NunitoBold'}
    }

    const { bold, style, children, ...newProps } = props
    return (
        <Text {...newProps} style={[props.style, font]}>
            {props.children}
        </Text>
    )
}