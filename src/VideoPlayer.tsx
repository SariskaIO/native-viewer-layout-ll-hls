import { StyleSheet, SafeAreaView, Text, TouchableOpacity, Image, View, TextInput } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';

import React, { useEffect } from "react";
import { Header } from 'react-native-elements'; // Import Icon from react-native-elements
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import SuperChat from "./Superchat";
import {extractStreamFromUrl,isHLSURL} from "./Utils";

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
      height: "100%",
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
      margin: 0,
      padding: 0,
      borderWidth: 0, // Add this line to remove the border
      display: "flex",
      backgroundColor:  "#0f0f0f",
      alignItems: 'center', // Align items in the center horizontally
      justifyContent: 'space-between', // Align items with equal space between them horizontally
      flexDirection: 'row', // Arrange items horizontally,
      borderBottomColor: '#0f0f0f'
    },
    videoPlayer: {
      height: 200,
      borderWidth: 0, // Add this line to remove the border
      padding: 0,
      margin: 0
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
      height: 120,
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center'
    },
    videoContainer: {
      width: "100%",
      borderWidth: 0, // Add this line to remove the border
      padding: 0,
      margin: 0,
      paddingBottom: 20,
    },
    video: {
      height: 300,
      width: "100%",
      borderWidth: 0, // Add this line to remove the border
      padding: 0,
      margin: 0
    },
    chatContainer: {
      flex: 1,
      backgroundColor: "#0f0f0f",
      borderWidth: 0, // Add this line to remove the border
    },
    currentViewer: {
      height: 100,
      display: "flex",
      color: "white",
      flex: 1,
      justifyContent: "center"
    }
});


export default function videoPlayer() {
  const [showSearchBar, setShowSearchBar] = React.useState(false);
  const [hls, setHls] = React.useState('');
  const [viewerCount, setViewerCount] = React.useState(0);
  const [uptime, setUpTime] = React.useState(0);

  const renderCenterComponent = () => {
      return (
          <View style={styles.searchContainer}>
              {showSearchBar ? (
                  <TextInput
                      onEndEditing={({ nativeEvent }) => handlePaste(nativeEvent.text)}
                      placeholder="Enter HLS URL"
                      onChangeText={setHls}
                      value={hls}
                      style={styles.searchBar}
                  />
              ) : (
                 <Text style={styles.title} >SARISKA LIVE</Text>
              )}
          </View>
      );
  };

  const handlePaste = (text) => { 
    // Check if the pasted text is an HLS URL
    if (isHLSURL(text)) {
      // Process the HLS URL here, for example, append it to the message with a specific format
      setHls(text);
    }
  };

  function updateViewerCount() {
    var stream = extractStreamFromUrl(hls);
    var viewerUrl = "https://api.sariska.io/llhls/v1/hooks/srs/live/viewers/count/";
    var requestUrl = viewerUrl + stream;

    fetch(requestUrl)
        .then(response => response.json())
        .then(data => {
            const count = data["stream:"+stream].current_viewers;
            const uptime = data["stream:"+stream].uptime;
            setUpTime(uptime);
            setViewerCount(count);
        })
        .catch(error => {
            console.error('Error fetching viewer count:', error);
        });
  }

  function timeElapsed(timestamp) {
    const elapsedTime = timestamp; // Convert milliseconds to seconds
    if (elapsedTime < 60) {
        return `${Math.floor(elapsedTime)} seconds ago`;
    } else if (elapsedTime < 3600) {
        const minutes = Math.floor(elapsedTime / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (elapsedTime < 86400) {
        const hours = Math.floor(elapsedTime / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(elapsedTime / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
}


  useEffect(()=>{
    setInterval(updateViewerCount, 10000);
  }, [])

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
      <SafeAreaProvider style={styles.container}>
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
                resizeMode="cover"
                style={styles.video}
                source={{ uri: hls }}
                controls={true}
                minLatency={0} // Set minimum acceptable latency to 0 seconds
                maxLatency={3} // Set maximum acceptable latency to 3 seconds
              />
                <Text style={{color: "white", marginTop: 20}}>Currently Viewing {viewerCount} people and stream started streaming {timeElapsed(uptime)}</Text>
          </View>
          <View style={styles.chatContainer}>
            <SuperChat channelName={extractStreamFromUrl(hls)} />
          </View>
      </SafeAreaProvider>
  );
}