import React, { useState, useEffect , useRef} from 'react';

import { View, TextInput, TouchableOpacity, StyleSheet, Animated, Easing, Text, Keyboard, ScrollView, Platform , Image} from 'react-native';
import { Socket } from 'phoenix';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Emoji from './Emoji';
import { getToken } from "./Utils";
import DocumentPicker from 'react-native-document-picker';
import FileViewer from "react-native-file-viewer";
import RNFS from 'react-native-fs'; // Import react-native-fs
import RNFetchBlob from 'rn-fetch-blob';

let socket = null;
let channel = null;

const SuperChat = ({ channelName='test23eh23h' }) => {
  const [message, setMessage] = useState('');
  const [inputContainerBottom] = useState(new Animated.Value(0));
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [fileUri, setFileUri] = useState('');
  const [fileName, setFileName] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollViewRef = useRef();
  const [currentUser, setCurrentUser] = useState({});
  const [currentRoom, setCurrentRoom] =  useState({});
  const [imageAttaced, setImageAttaced] = useState("");

  
  // Scroll to the bottom of the chat container when messages are updated
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);


  useEffect(() => {
    const startChatApp = async () => {
      if (socket) {
        socket.disconnect();
      }

      if (channel) {
        channel.leave();
      }

      socket = new Socket("wss://api.sariska.io/api/v1/messaging/websocket", { params: { token: await getToken() } });
      socket.connect();

      console.log("channel name",`chat:${channelName.toLowerCase()}` );

      channel = socket.channel(`chat:${channelName.toLowerCase()}`);
      channel.join()
        .receive("ok", (e) => console.log("Channel joined", e))
        .receive("error", (e) => console.log("Failed to join", e))
        .receive("timeout", (e) => console.log("Waiting for the connection to stabilize", e));

      socket.onOpen = () => {
          console.log("socket onOpen");
      };

      socket.onClose = () => {
          console.log("Socket onClose");
      };

      socket.onError = (error) => {
          console.log("Socket onError", error);
      };

      socket.connect();


      channel.on('presence_state', function (payload) {
          const currentlyOnlinePeople = Object.entries(payload).map(elem => ({username: elem[1].metas[0].name, id: elem[1].metas[0].phx_ref}));
          console.log("currentlyOnlinePeople", currentlyOnlinePeople);
      });

      channel.on('presence_diff', function (payload) {
          if(payload.joins && payload.leaves) {
              const currentlyOnlinePeople = Object.entries(payload.joins).map(elem => ({username: elem[1].metas[0].name, id: elem[1].metas[0].phx_ref}));
              const peopleThatLeft = Object.entries(payload.leaves).map(elem => ({username: elem[1].metas[0].name, id: elem[1].metas[0].phx_ref}));
              console.log("currentlyOnlinePeople", currentlyOnlinePeople);
              console.log("peopleThatLeft", peopleThatLeft);
          }
      });

      channel.on("user_joined", (payload) => {
          const user = payload.user;
          const room = payload.room;
          console.log("current user joined", user);
          setCurrentUser(user);
          setCurrentRoom(room);
      });
        // Listening to 'new_message' events
      channel.on('new_message', function (payload) {
        console.log("new message received", payload);
        appendMessage(payload);
      });
    
      // Listening to 'listen event for archived_message' events
      channel.on('archived_message', function (payload) {
        console.log("archived message received", payload);
        appendMessage(payload);
      });
    };

    startChatApp();

    const keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', keyboardDidShow);
    const keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', keyboardDidHide);
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [channelName]);

  const sendMessage = () => {   
     if (!fileUri && !message) {
      return;
     }

     if (showEmojiPicker) {
      setShowEmojiPicker(false);
     }

     if (fileUri) {
      channel.push('new_message', {
        content_type: "file",
        content: fileUri,
      });
      setFileUri('');
      setImageAttaced(false);
    } else {
      channel.push('new_message', {
        content_type: "text",
        content: message,
      });
      setMessage('');
    }
  };

  // Function to append new message to the state
  const appendMessage = (newMessage) => {
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  const keyboardDidShow = () => {
    Animated.timing(inputContainerBottom, {
      toValue: 300,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const keyboardDidHide = () => {
    Animated.timing(inputContainerBottom, {
      toValue: 0,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    return false;
  };

  getPresignedUrl = async (fileType, fileName) => {
    try {
        const token = await getToken(); // Assuming you're using AsyncStorage for storing token
        const response = await fetch('https://api.sariska.io/api/v1/misc/get-presigned', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                fileType,
                fileName,
            }),
        });
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Failed to get presigned URL');
        }
    } catch (error) {
        throw error;
      }
  };

  pickFile = async () => {
    try {
        const res = await DocumentPicker.pick({
            type: [DocumentPicker.types.allFiles],
        });
        const [{ name, type, uri }] = res;
        const filePath = Platform.OS === 'ios'
            ? uri.replace('file:///', '').replace('file://', '')
            : uri.replace('file://', '').replace('file:/', '');
        setFileUri(uri);
        setFileName(name);

        const presignedUrlResponse = await this.getPresignedUrl(type, name);
        const { presignedUrl } = presignedUrlResponse;

        console.log('presignedUrl', presignedUrl);

        const headers = {
            'Content-Type': type,
            'Content-Disposition': 'attachment',
            'ACL': 'public-read',
        };

        try {
            await RNFetchBlob.fetch('PUT', presignedUrl, headers, RNFetchBlob.wrap(filePath));
            const url = presignedUrl.split('?')[0];
            setFileUri(url);
            setImageAttaced(true);
        } catch (uploadError) {
            console.log("Failed to upload file to S3:", uploadError);
            // Log additional details if needed
            console.log("Upload Error Details:", uploadError.response().text());
        }
    } catch (pickError) {
        console.log('Failed to pick file:', pickError);
        // Log additional details if needed
        console.log("Pick Error Details:", pickError.message);
    }
  };

  const getFileExtension = (url) => {
    const parts = url.split('.');
    return parts[parts.length - 1];
  };

  const renderFileContentLarge = (content) => {
    const fileType = getFileExtension(content);
    if (fileType === 'jpg' || fileType === 'jpeg' || fileType === 'png') {
      // Render image if the file extension is jpg, jpeg, or png
      return <Image style={styles.fileImageLarge} source={{ uri: content }} />
    } else {
      // Render MaterialIcon for other file types
      return  <Icon name="attach-file" size={100} color="white" />
    }
  };

  const renderFileContent = (content) => {
    const fileType = getFileExtension(content);
    if (fileType === 'jpg' || fileType === 'jpeg' || fileType === 'png') {
      // Render image if the file extension is jpg, jpeg, or png
      return  <Image style={styles.fileImage } source={{ uri: content }} />;
    } else {
      // Render MaterialIcon for other file types
      return  <Icon name="cloud-download" size={30} color="white" />;
    }
  };


  const getInitials = (name) => {
    const nameArray = name.split(' ');
    return nameArray.map((n) => n.charAt(0)).join('').toUpperCase();
  };

  const handleFileOpen = async (url) => {
    const extension = url.split(/[#?]/)[0].split('.').pop().trim();
    console.log("extension", extension);

    const localFile = `${RNFS.DocumentDirectoryPath}/temporaryfile.${extension}`;
    const options = {
      fromUrl: url,
      toFile: localFile,
    };
    try {
      console.log("options", options);
      await RNFS.downloadFile(options).promise;
      await FileViewer.open(localFile);
    } catch (error) {
      console.error('Error downloading or opening file:', error);
    }
  };

  return (
    <View style={styles.container}>
      { !imageAttaced ? 
      <ScrollView ref={scrollViewRef} style={styles.chatMessageContainer}>
        {messages.map((message, index) => (
          <View key={index} style={message.created_by == currentUser.id ? styles.currentUserMessage : styles.otherUserMessage}>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>{getInitials(message.created_by_name)}</Text>
            </View>
            <View style={styles.messageContent}>
              <Text style={styles.messageSender}>{message.created_by_name}</Text>
              {message.content_type === 'file' ? (
                <TouchableOpacity onPress={() => handleFileOpen(message.content)}>
                    {renderFileContent(message.content)}
                </TouchableOpacity>
              ) : (
                <Text style={styles.messageText}>{message.content}</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView> : <View style={styles.largeFileAttached}>{renderFileContentLarge(fileUri)}</View>}
      <View style={{flex: 1}}>
        <Animated.View style={[styles.inputAndEmojiContainer, { bottom: inputContainerBottom }]}>
          <View>
              {showEmojiPicker && (
                <TouchableOpacity>
                  <Emoji
                    onPress={(e) => {
                      e.stopPropagation();
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                    }}
                    handlePick={(emoji) => {
                      console.log("emoji", emoji);
                      setMessage(message + emoji.emoji);
                    }}
                  />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.inputContainer}>
              <TouchableOpacity onPress={pickFile}>
                <Icon name="add" size={24} color="white" style={styles.addButton} />
              </TouchableOpacity>
              <TextInput
                placeholder="Type your message"
                style={styles.input}
                placeholderTextColor="#999"
                value={message}
                onChangeText={setMessage}
                onPaste={(event) => handlePaste(event.nativeEvent.text)}
                keyboardType={'default'}
              />
              <TouchableOpacity onPress={toggleEmojiPicker}>
                <Icon name="insert-emoticon" size={24} color="gray" style={styles.emoji} />
              </TouchableOpacity>
              <TouchableOpacity onPress={sendMessage}>
                <Icon name="send" size={24} color="white" style={styles.sendButton} />
              </TouchableOpacity>
            </View>
        </Animated.View>
      </View>

    </View>
  );
};

export default SuperChat;

const styles = StyleSheet.create({
  chatMessageContainer: {
    backgroundColor: "#333333",
    height: 300,
    paddingHorizontal: 10,
    paddingBottom: 20,
    marginBottom: 20
  },
  fileImageLarge: {
    height: 300,
    width: "100%"
  },  
  largeFileAttached: {
    height: 300,
    justifyContent: 'center', // Centers content horizontally
    alignItems: 'center', // Centers content vertically
  },
  currentUserMessage: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  otherUserMessage: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  messageText: {
    fontSize: 16,
    color: 'white',
    marginHorizontal: 5,
  },
  addButton: {
    position: 'absolute',
    left: -195,
    bottom: -30
  },
  container: {
    flex: 5,
    position: 'relative',
  },
  inputAndEmojiContainer: {
    flex: 1,
    position: 'absolute',
    left: 0,
    backgroundColor: '#0f0f0f',
    right: 0,
    bottom: 0
  },
  inputContainer: {
    flex: 1,
    display: 'flex',
    borderBottomColor: '#0f0f0f',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingHorizontal: 10,
    height: 100,
    left: 0,
    position: 'relative',
    alignItems: 'center',
    paddingBottom: 30,
    justifyContent: 'center',
    right: 0,
  },
  fileImage: {
     height: 100,
     width: "100%"
  },
  input: {
    display: 'flex',
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 40,
    width: 320,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  emoji: {
    position: 'absolute',
    left: 130,
    bottom: 10
  },
  sendButton: {
    padding: 10,
    position: 'absolute',
    borderRadius: 5,
    left: 165,
    bottom: 0
  },
  currentUserMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
    borderRadius: 8,
    margin: 5,
    maxWidth: '70%',
  },
  otherUserMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderRadius: 8,
    margin: 5,
    maxWidth: '70%',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'skyblue',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  attachedFile: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
  },
  messageContent: {
    flex: 1,
  },
  messageSender: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
  },
  fileLink: {
    color: 'blue',
    textDecorationLine: 'underline'
  }
});
