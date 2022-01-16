import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import React from "react";

export default function (props) {
    let users = props.users

    return (
        <ScrollView>
            <View>
                {users.map(item => (
                    <TouchableOpacity style={styles.profileSection} onPress={() => props.loadInv(props.nav, item.id)} onLongPress={() => props.deleteUser(item.id)}>
                        <Image style={styles.profilePicture} source={ { uri: item.url } } />
                        <View style={styles.column}>
                            <Text style={styles.profileID}>{item.id}</Text>
                            <Text style={styles.profileName}>{item.name}</Text>
                        </View>
                    </TouchableOpacity>
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
        margin: 16,
        padding: 4,
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#0E273E',
        elevation: 3,
    },
    profilePicture: {
        width:  48,
        height: 48,
        borderRadius: 8,
        marginEnd: 8
    },
    profileName: {
        fontSize: 13,
        fontWeight: "bold",
        color: '#aaa'
    },
    profileID: {
        fontSize: 15,
        fontWeight: "bold",
        color: '#ddd'
    },

})