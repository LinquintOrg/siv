import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import React from "react";
import {Divider} from "react-native-elements";

export default function (props) {
    let users = props.users

    return (
        <ScrollView>
            <View>
                {users.map((item, index) => (
                    <View>
                        <TouchableOpacity style={styles.profileSection} onPress={() => props.loadInv(props.nav, item.id)} onLongPress={() => props.deleteUser(item.id)}>
                            <Image style={styles.profilePicture} source={ { uri: item.url } } />
                            <View style={[styles.column, {paddingTop: 8}]}>
                                <Text style={styles.profileID}>{item.id}</Text>
                                <Text style={styles.profileName}>{item.name}</Text>
                            </View>
                        </TouchableOpacity>
                        { (users.length - 1 !== index) ? <Divider width={1} style={{width: '95%', alignSelf: 'center',}} /> : null }
                    </View>
                ))}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    column: {
        display: 'flex',
        flexDirection: 'column',
        width: '65%'
    },
    profileSection: {
        borderRadius: 8,
        marginVertical: 12,
        display: 'flex',
        flexDirection: 'row',
        width: '92%',
        alignSelf: 'center',
    },
    profilePicture: {
        width:  51,
        height: 51,
        borderRadius: 8,
        marginEnd: 8
    },
    profileName: {
        fontSize: 13,
        fontWeight: "bold",
        color: '#666'
    },
    profileID: {
        fontSize: 15,
        fontWeight: "bold",
        color: '#444'
    },

})