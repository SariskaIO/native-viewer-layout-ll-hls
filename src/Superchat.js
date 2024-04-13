import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard, Animated, Easing, Platform, AsyncStorage } from 'react-native'; // Include Platform module
import { Socket } from 'phoenix';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Emoji from './Emoji';

const SuperChat = ({ channelName }) => {
  const [socket, setSocket] = useState(null);
  const [channel, setChannel] = useState(null);
  const [message, setMessage] = useState('');
  const [inputContainerBottom] = useState(new Animated.Value(0));
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Changed state name

  useEffect(() => {
    startChatApp(channelName);
    const keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', keyboardDidShow);
    const keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', keyboardDidHide);
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      if (socket) {
        socket.disconnect();
      }
    };
  }, [channelName, showEmojiPicker]);

  const startChatApp = async (channelName) => {
    // Your existing code for starting the chat app
  };

  const getToken = async () => {
    // Your existing code for getting token
  };

  const sendMessage = () => {
    // Your existing code for sending message
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    return false;
  };

  const keyboardDidShow = () => {
    Animated.timing(inputContainerBottom, {
      toValue: 300,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const handlePress = (e) => {
    e.stopPropagation();
    // Your other logic here
  };
  
  const stopPropagation = (e) => {
    e.stopPropagation();
  };


  const keyboardDidHide = () => {
    Animated.timing(inputContainerBottom, {
      toValue: 0,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inputAndEmojiContainer, { bottom: inputContainerBottom }]}>
        <View onTouchEnd={(e)=>{ e.stopPropagation()}} onPress={stopPropagation}>
          {showEmojiPicker && (
            <TouchableOpacity onPress={handlePress}>
              <Emoji
                onPress={stopPropagation}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                }}
                onEmojiSelected={(emoji) => {
                  setMessage(message + emoji);
                }}
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type your message"
            style={styles.input}
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            keyboardType={'default'} // Change keyboardType to 'default'
          />
          <TouchableOpacity onPress={toggleEmojiPicker}>
            <Icon name="insert-emoticon" size={24} color="gray" style={styles.emoji} />
          </TouchableOpacity>
          <TouchableOpacity onPress={sendMessage}>
            <Icon name="send" size={24} color="gray" style={styles.sendButton} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default SuperChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f0f0f0',
    borderTopColor: '#0f0f0f'
  },
  inputAndEmojiContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  inputContainer: {
    display: 'flex',
    borderBottomColor: '#0f0f0f',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingHorizontal: 10,
    height: 100,
    position: 'relative',
    alignItems: 'center',
    paddingBottom: 30,
    justifyContent: 'center',
    right: 0,
    borderTopColor: '#0f0f0f'
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
    left: 155,
    bottom: 0
  },
});
