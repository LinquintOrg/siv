import {
    View,
    StyleSheet
} from "react-native";
import React from "react";
import Text from '../Elements/text'

export default function(props) {
    const kit = props.kit
    const prices = props.prices
    const scale = props.scale

    const transformHash = (str) => {
        do {
            str = str.replace(', ', ',')
        } while (str.includes(', '))
        return str
    }

    const resize = (size) => {
        return Math.ceil(size * scale)
    }

    const title = transformHash((kit.artist + ',' + kit.song).toLowerCase())
    const stTitle = 'st ' + title

    let pNormal = null
    let pStat = null

    for (let i = 0; i < prices.length; i++) {
        if (title === prices[i].Hash) {
            pNormal = Math.round(props.exchange * prices[i].Price * 100) / 100
        }
        if (stTitle === prices[i].Hash) {
            pStat = Math.round(props.exchange * prices[i].Price * 100) / 100
        }
        if (pNormal !== null && pStat !== null) break;
    }

    const styles = StyleSheet.create({
        price: {
            fontSize: resize(14),
            color: '#333',
            textAlignVertical: 'center',
            width: '30%',
            textAlign: 'right',
            alignContent: 'space-between'
        },
        containerCol: {
            display: 'flex',
            flexDirection: 'column',
            width: '63%',
        },
    })

    if (pNormal === null && pStat === null) {
        return (
            <View style={[styles.containerCol]}>
                <Text style={styles.price}>Cannot be sold</Text>
            </View>
        )
    }
    if (pNormal === null) {
        return (
            <View style={styles.containerCol}>
                <Text style={styles.price}>NaN</Text>
                <Text style={[styles.price, {color: '#CF6A32'}]}>{props.rate} {pStat.toFixed(2)}</Text>
            </View>
        )
    }
    if (pStat === null) {
        return (
            <View style={styles.containerCol}>
                <Text style={styles.price}>{props.rate} {pNormal.toFixed(2)}</Text>
                <Text style={[styles.price, {color: '#CF6A32'}]}>NaN</Text>
            </View>
        )
    }
    return (
        <View style={styles.containerCol}>
            <Text style={styles.price}>{props.rate} {pNormal.toFixed(2)}</Text>
            <Text style={[styles.price, {color: '#CF6A32'}]}>{props.rate} {pStat.toFixed(2)}</Text>
        </View>
    )
}