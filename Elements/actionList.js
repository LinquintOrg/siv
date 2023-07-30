import {
	Dimensions,
	ScrollView,
	StyleSheet,
	View
} from "react-native";
import React, {useState} from "react";
import {Icon} from "react-native-elements";
import Text from '../Elements/text'
import { ActivityIndicator } from "react-native-paper";

export default function (props) {
	const [scale] = useState(Dimensions.get('window').width / 423);
	const resize = (size) => {
		return Math.ceil(size * scale)
	}

	const steam_id = props.steamid;

	const _renderInventory = ({game, id}) => {
		return (
			<View style={[styles.container, styles.inventory, id === props.act ? {backgroundColor: '#12428D'} : null]}>
				{id === props.act ? <ActivityIndicator size={'small'} color={'#F2FAFD'} /> :
					id < props.act ? <Icon name={'check'} type={'entypo'} size={resize(20)} color={'#12428D'} /> : 
					<Icon name={'query-builder'} size={resize(20)} color={'#12428D'} /> }
				<Text style={[styles.text, id === props.act ? {color: '#F2FAFD'} : {color: '#12428D'}]}>
					{((id === props.act) ? 'Loading ' : (id < props.act) ? 'Loaded ' : 'Load ') + game} inventory
				</Text>
			</View>
		)
	}

	const _renderPause = ({timeout, id}) => {
		return (
			<View style={[styles.container, styles.pause, id === props.act ? {borderColor: '#179D6C', borderWidth: 3,} : null]}>
				<Text style={[styles.text, {color: '#179D6C', fontSize: resize(12)}]}>{timeout} second timeout</Text>
			</View>
		)
	}

	const _renderPrices = ({len, id}) => {
		return (
			<View style={[styles.container, styles.prices, id === props.act ? {backgroundColor: '#CC705B'} : null]}>
				{id === props.act ? <ActivityIndicator size={'small'} color={'#E8E0C5'} /> : 
					id < props.act ? <Icon name={'check'} type={'entypo'} size={resize(20)} color={'#CC705B'} /> : 
					<Icon name={'query-builder'} size={resize(20)} color={'#CC705B'} /> }
				<Text style={[styles.text, id === props.act ? {color: '#E8E0C5'} : {color: '#CC705B'}]}>{((id === props.act) ? 'Loading ' : 'Load ')}{ (len == 1) ? '1 game ' : (len + ' games ')}prices</Text>
			</View>
		)
	}

	return (
		<ScrollView>
			<Text style={styles.title}>Loading inventory</Text>
			<View style={styles.profileColumn}>
				<Text>Loading inventory for:</Text>
				<Text bold>{ steam_id }</Text>
			</View>

			{props.list.map((action, index) => (
				<View>
					{action.action === 0 ? <_renderInventory id={index} game={action.extra} />
					: action.action === 1 ? <_renderPause id={index} timeout={action.extra} />
					: <_renderPrices id={index} len={action.extra} />}

					{action.action === 2 ? <Icon name={'check'} type={'entypo'} size={resize(24)} /> :
						<Icon name={'chevron-down'} type={'entypo'} size={resize(24)} /> }
				</View>
			))}
		</ScrollView>
	)
}

const resize = (size) => {
	const scale = Dimensions.get('window').width / 423
	return Math.ceil(size * scale)
}

const styles = StyleSheet.create({
	container: {
		width: '90%',
		alignSelf: 'center',
		marginVertical: resize(4),
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
	},
	inventory: {
		borderColor: '#12428D',
		borderRadius: 16,
		padding: resize(8),
	},
	pause: {
		padding: resize(4),
		borderRadius: 16,
	},
	prices: {
		borderColor: '#CC705B',
		borderRadius: 16,
		padding: resize(8),
	},
	text: {
		textAlign: 'center',
		fontSize: resize(14),
		marginLeft: resize(8),
	},
	profileColumn: {
		display: 'flex',
		flexDirection: 'column',
		padding: resize(12),
		backgroundColor: '#fff',
		borderRadius: 16,
		width: '90%',
		marginVertical: resize(16),
		alignSelf: 'center',
	},
	title: {
		fontSize: resize(24),
		color: '#333',
		textAlign: 'center',
	}
})