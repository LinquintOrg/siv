import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import React, {useState} from "react";
import {Divider} from "react-native-elements";
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
                        <TouchableOpacity style={styles.profileSection} onPress={() => props.loadInv(props.nav, item.id)} onLongPress={() => props.toggleModal(item)}>
                            <Image style={styles.profilePicture} source={ { uri: item.url } } />
                            <View style={[styles.column, {paddingTop: resize(6)}]}>
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

})