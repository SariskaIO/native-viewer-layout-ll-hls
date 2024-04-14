import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import EmojiPicker from "rn-emoji-picker";
import { emojis } from "rn-emoji-picker/dist/data";
import { StatusBar } from "expo-status-bar";

export default function Emoji({ handlePick }) {
  const [recent, setRecent] = useState([]);
    console.log("reached here.......................")
  const onEmojiSelected = (emoji) => {
    console.log("Selected emoji:", emoji);
    // Do something with the selected emoji, e.g., call handlePick
    handlePick(emoji);
  };

  return (
    <View style={styles.container}>
      <View style={styles.emojiPickerContainer}>
        <EmojiPicker
          emojis={emojis}
          recent={recent}
          autoFocus={true}
          loading={false}
          darkMode={true}
          perLine={7}
          onSelect={handlePick} // Use onSelect for debugging purposes
          onChangeRecent={setRecent}
        />
      </View>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 50,
  },
  emojiPickerContainer: {
    flex: 1,
    height: 300,
    backgroundColor: "#000", // Optional: customize background color
  },
});
