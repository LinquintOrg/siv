import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import React, {useState} from "react";
import {Divider, Icon} from "react-native-elements";
import Text from '../Elements/text'

export default function (props) {
    let users = props.users

    const [scale] = useState(Dimensions.get('window').width / 423);
    const resize = (size) => {
        return Math.ceil(size * scale)
    }

    return (
        <ScrollView>
            <View>
                {users.map((item, index) => (
                    <View>
                        <TouchableOpacity style={styles.profileSection} onPress={() => {
                                if (item.public) props.loadInv(props.nav, item.id)
                                else props.displayErr()
                            }} onLongPress={() => props.toggleModal(item)}>
                            <Image style={styles.profilePicture} source={ { uri: item.url } } />
                            <View style={[styles.column]}>
                                <View style={styles.row}>
                                    {
                                        (item.state === 0) ? <Icon name={'circle'} type={'font-awesome'} color={'#f00'} size={resize(16)} />
                                        : (item.state === 1) ? <Icon name={'circle'} type={'font-awesome'} color={'#0a0'} size={resize(16)} />
                                        : (item.state === 2) ? <Icon name={'circle'} type={'font-awesome'} color={'#fa0'} size={resize(16)} />
                                        : <Icon name={'sleep'} type={'material-community'} color={'#44f'} size={resize(16)} />
                                    }
                                    <Text bold style={[{fontSize: resize(14), marginLeft: 8, color: (item.public) ? '#337' : '#f00'}]}>{(!item.public) ? 'Profile is set to PRIVATE' : 
                                    (item.state === 0) ? 'Offline'
                                    : (item.state === 1) ? 'Online'
                                    : (item.state === 2) ? 'Busy'
                                    : 'Away'}</Text>
                                </View>
                                <Text bold style={styles.profileID}>{item.id}</Text>
                                <Text bold style={styles.profileName}>{item.name}</Text>
                            </View>
                        </TouchableOpacity>
                        { (users.length - 1 !== index) ? <Divider width={1} style={{width: '95%', alignSelf: 'center',}} /> : null }
                    </View>
                ))}
            </View>
        </ScrollView>
    )
}

const resize = (size) => {
    const scale = Dimensions.get('window').width / 423
    return Math.ceil(size * scale)
}

const styles = StyleSheet.create({
    column: {
        display: 'flex',
        flexDirection: 'column',
        width: '65%'
    },
    profileSection: {
        borderRadius: 8,
        marginVertical: resize(12),
        display: 'flex',
        flexDirection: 'row',
        width: '92%',
        alignSelf: 'center',
    },
    profilePicture: {
        width:  resize(52),
        height: resize(52),
        borderRadius: 8,
        marginEnd: resize(8)
    },
    profileName: {
        fontSize: resize(14),
        color: '#666'
    },
    profileID: {
        fontSize: resize(14),
        color: '#444'
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%'
    }
})