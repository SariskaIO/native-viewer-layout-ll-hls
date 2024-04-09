import React, {useState} from "react";
import {StyleSheet, View, ScrollView} from 'react-native';
import EmojiPicker from "rn-emoji-picker";
import {emojis} from "rn-emoji-picker/dist/data";
import {StatusBar} from 'expo-status-bar';

export default function Emoji() {
    const [recent, setRecent] = useState([]);

    return (
        <View style={styles.container}>
            <View style={styles.emojiPickerContainer}>
                <ScrollView style={{flex: 1}}>
                    <EmojiPicker
                        emojis={emojis}
                        recent={recent}
                        autoFocus={true}
                        loading={false}
                        darkMode={true}
                        perLine={7}
                        onSelect={console.log}
                        onChangeRecent={setRecent}
                    />
                </ScrollView>
            </View>
            <StatusBar style="light"/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingTop: 50
    },
    emojiPickerContainer: {
        height: 200, // Fixed height of 100
        backgroundColor: '#000', // Optional: customize background color
    },
});
