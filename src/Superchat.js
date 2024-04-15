import React, { useState, useEffect , useRef} from 'react';

import { View, TextInput, TouchableOpacity, StyleSheet, Animated, Easing, Text, Keyboard, ScrollView } from 'react-native';
import { Socket } from 'phoenix';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Emoji from './Emoji';
import { getToken } from "./Utils";
import DocumentPicker from 'react-native-document-picker';

let socket = null;
let channel = null;
var addedIds = []

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

      channel = socket.channel(`chat:${channelName.toLowerCase()}`);
      channel.join()
        .receive("ok", (e) => console.log("Channel joined"))
        .receive("error", (e) => console.log("Failed to join"))
        .receive("timeout", (e) => console.log("Waiting for the connection to stabilize"));

      socket.onOpen = () => {
          console.log("Socket opened", socket);
      };

      socket.onClose = () => {
          console.log("Connection dropped");
      };

      socket.onError = (error) => {
          console.log("Socket error", error);
          console.error("There was an error with the connection");
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
        // Listening to 'shout' events
      channel.on('new_message', function (payload) {
        console.log("payload", payload)
        appendMessage(payload);
      });
    
      // Listening to 'shout' events
      channel.on('archived_message', function (payload) {
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


  // Function to append new message to the state
  const appendMessage = (newMessage) => {
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  const sendMessage = () => {
    console.log("send message", message);

    if (fileUri) {
      channel.push('new_message', {
        content_type: "file",
        content: fileUri,
      });
    } else {
      channel.push('new_message', {
        content_type: "text",
        content: message,
      });
    }
    setMessage('');
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

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      setFileUri(res.uri);
      setFileName(res.name);
    } catch (error) {
      console.log('Error picking file:', error);
    }
  };


  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    return false;
  };

  async function getPresignedUrl(params) {
    try {
        const response = await fetch("https://api.sariska.io/api/v1/misc/get-presigned", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${yourAuthToken}` // Replace yourAuthToken with the actual token
            },
            body: JSON.stringify({
                fileType: params.fileType,
                fileName: params.fileName
            })
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('Failed to fetch presigned URL');
        }
    } catch (error) {
        console.log('Error fetching presigned URL:', error);
        throw error;
    }
  }

  const handleFileUpload = async (uri, name) => {
    try {
        const signedUrl = await getPresignedUrl({ fileName: name });
        const response = await fetch(signedUrl, {
            method: 'PUT',
            body: uri,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': 'attachment',
                'ACL': 'public-read'
            }
        });

        if (response.ok) {
            // Handle successful upload
            const url = signedUrl.split('?')[0];
            setFileUri(url);
            setFileName(name);
        } else {
            throw new Error('Failed to upload');
        }
    } catch (error) {
        console.log('Failed to upload:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} style={styles.chatMessageContainer}>
        {messages.map((message, index) => (
          <View key={index} style={message.created_by === currentUser.id ? styles.currentUserMessage : styles.otherUserMessage}>
            <Text style={styles.messageText}>{message.created_by_name}</Text>
            <Text style={styles.messageText}>{message.content}</Text>
          </View>
        ))}
      </ScrollView>
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
  );
};

export default SuperChat;

const styles = StyleSheet.create({
  chatMessageContainer: {
    height: 300,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  currentUserMessage: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  otherUserMessage: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
    flex: 1,
    position: 'relative',
  },
  inputAndEmojiContainer: {
    left: 0,
    right: 0,
    bottom: 0,
  },
  inputContainer: {
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
});
