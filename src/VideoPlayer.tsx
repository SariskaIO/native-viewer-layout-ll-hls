import { StyleSheet, SafeAreaView, Text, TouchableOpacity, Image, View, TextInput } from "react-native";
import React from "react";
import { Header } from 'react-native-elements'; // Import Icon from react-native-elements
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';

const styles = StyleSheet.create({
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    leftComponentContainer: {
      position: 'absolute',
      display: 'flex',
      alignContent: 'center',
      justifyContent: 'center',
    },
    headerLeftImage: {
        width: 40,
        height: 40,
        marginRight: 10,
    },
    searchBar: {
      display: 'flex',
      position: 'absolute',
      fontSize: 16,
      paddingLeft: 20,
      paddingRight: 20,
      height: 40,
      width: 320,
      borderRadius: 30,
      backgroundColor: 'white',
    },
    container: {
        flex: 1,
        backgroundColor: "#0f0f0f",
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        color: "#fff",
        display:"flex",
        alignItems: "center",
        justifyContent: "center"
    },
    header: {
      display: "flex",
      backgroundColor:  "#0f0f0f",
      alignItems: 'center', // Align items in the center horizontally
      justifyContent: 'space-between', // Align items with equal space between them horizontally
      flexDirection: 'row' // Arrange items horizontally
    },
    videoPlayer: {
      width: '100%',
      height: 300,
      backgroundColor: 'black',
    },
    leftComponent: {
      flex: 1, // Make the left component take 1/3 of the header's width
      alignItems: 'flex-start', // Align items to the start of the container (left)
    },
    centerComponent: {
      flex: 1, // Make the center component take 1/3 of the header's width
      alignItems: 'center', // Align items in the center horizontally
    },
    rightComponent: {
      flex: 1, // Make the right component take 1/3 of the header's width
      alignItems: 'flex-end', // Align items to the end of the container (right)
    },
    searchContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    headerContainer: {
      margin: 0,
      padding: 0,
      borderWidth: 0, // Add this line to remove the border
      height: 60,
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center'
    },
    videoContainer: {
      borderWidth: 0, // Add this line to remove the border
      padding: 0,
      margin: 0
    }
});

export default function App() {
  const [showSearchBar, setShowSearchBar] = React.useState(false);
  const [hls, setHls] = React.useState('');

  const renderCenterComponent = () => {
      return (
          <View style={styles.searchContainer}>
              {showSearchBar ? (
                  <TextInput
                      placeholder="Enter HLS URL"
                      onChangeText={setHls}
                      value={hls}
                      style={styles.searchBar}
                  />
              ) : (
                 <Text style={styles.title} >HLS Player</Text>
              )}
          </View>
      );
  };

  const renderLeftComponent = () => {
    return (
        <View style={styles.leftComponentContainer}>
            {showSearchBar ? (
                <TouchableOpacity
                    onPress={() => setShowSearchBar(!showSearchBar)}
                >
                    <Icon name="arrow-back" size={40} color={"white"} style={{position: 'absolute', left: -13, top: -20}} />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={() => { console.log('A Pressed!') }}>
                    <Image
                        style={styles.headerLeftImage}
                        source={{ uri: 'https://assets.sariska.io/Logo_Full_white.png' }}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
  };

  return (
      <SafeAreaView style={styles.container}>
          <View style={styles.headerContainer}>
            <Header
                containerStyle={styles.header}
                leftComponent={()=>renderLeftComponent()} // Use icon name directly
                centerComponent={()=>renderCenterComponent()} // Apply title styles
                rightComponent={!showSearchBar && 
                  <TouchableOpacity onPress={() => {
                      setShowSearchBar(!showSearchBar); 
                    }}>
                    <Icon name="search" size={40} color={"white"} />
                  </TouchableOpacity>
                }
            />
          </View>
          <View style={styles.videoContainer} >
            <Video
                source={{ uri: 'https://bitmovin-a.akamaihd.net/content/playhouse-vr/m3u8s/105560.m3u8' }}
                style={styles.videoPlayer}
                controls={true}
              />
          </View>
      </SafeAreaView>
  );
}