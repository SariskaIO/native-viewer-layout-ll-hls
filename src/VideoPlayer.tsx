import { SearchBar } from '@rneui/themed';
import * as React from "react";
import { Header } from "@rneui/base";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/EvilIcons';
import { TouchableOpacity, Image, View, StyleSheet, TextInput, Text } from "react-native";
import Feather from 'react-native-vector-icons/Feather'; // Import the appropriate icon library
import Video from 'react-native-video';
import Superchat from "./Superchat";

export default () => {
  const [showSearchBar, setShowSearchBar] = React.useState(false);
  const [hls, setHls] = React.useState('');

  const renderLeftComponent = () => {
    return (
      <>
        {showSearchBar ? (
          <TouchableOpacity
            onPress={() => setShowSearchBar(!showSearchBar)}
            style={[styles.searchIcon, showSearchBar && styles.searchIconActive]}
          >
            <Feather name="arrow-left" size={50} color={"black"} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => { console.log('A Pressed!') }}>
            <Image
              style={{ width: 50, height: 50 }}
              source={{ uri: 'https://assets.sariska.io/Logo_Full_white.png' }}
            />
          </TouchableOpacity>
        )}
      </>
    );
  };
  

  const renderCenterComponent = () => {
    if (showSearchBar) {
      return (
        <TextInput
          placeholder="Enter HLS URL"
          onChangeText={setHls}
          value={hls}
          style={styles.searchBar}
        />
      );
    } else {
      return (
        <View>
          <Text style={styles.heading}>HLS Player</Text>
        </View>
      );
    }
  };

  const renderRightComponent = () => {
    return (
      <TouchableOpacity
        onPress={() => setShowSearchBar(!showSearchBar)}
        style={[styles.searchIcon, showSearchBar && styles.searchIconActive]}
      >
        <Icon name="search" size={50} color={ showSearchBar?  "black": "#fff" } />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView>
      <Header
        containerStyle={{ width: "100%", height: 70}}
        leftContainerStyle={styles.leftIconContainer}
        leftComponent={() => renderLeftComponent()}
        rightContainerStyle={styles.iconContainer}
        rightComponent={() => renderRightComponent()}
        centerComponentStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '350' }}
        centerComponent={renderCenterComponent}
      />
      <View>
        <Video
            source={{ uri: 'https://bitmovin-a.akamaihd.net/content/playhouse-vr/m3u8s/105560.m3u8' }}
            style={styles.videoPlayer}
            controls={true}
          />
      </View>
      <View>
        <Superchat channelName={"test"} />
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    alignItems: 'center',
    height: '100%',
    width: 380
  },
  searchBar: {
    fontSize: 16,
    paddingLeft: 20,
    paddingRight: 20,
    margin: 10,
    height: 50,
    width: 380,
    borderRadius: 50,
    backgroundColor: 'white',
  },
  headingContainer: {
    flex: 1, // Use flex to take up available space
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Center items vertically
    justifyContent: 'space-between', // Space between items
    paddingHorizontal: 10, // Add padding for left and right components
  },
  heading: {
    fontSize: 24
  },
  searchIcon: {
    paddingHorizontal: 10,
    color: 'red'
  },
  searchIconActive: {
    position: 'absolute',
    paddingTop: 15,
    left: 20,
    color: 'red'
    // Add styles for the active state
    // For example, change color or add a border
  },
videoContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
  leftIconContainer: {
    paddingHorizontal: 10
  },
  iconContainer: {
    paddingHorizontal: 10,
  },
  videoPlayer: {
    width: '100%',
    height: 300,
    backgroundColor: 'black',
  }
});
