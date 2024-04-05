import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Socket } from 'phoenix'; // Make sure to import the correct library for Phoenix sockets in React Native
import AsyncStorage from '@react-native-async-storage/async-storage';

const generateRandomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

const SuperChat = ({ channelName }) => {
  const [socket, setSocket] = useState(null);
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    startChatApp(channelName);
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [channelName]);

  const startChatApp = async (channelName) => {
    if (socket) {
      socket.disconnect();
    }

    const newSocket = new Socket("wss://api.sariska.io/api/v1/messaging/websocket", {
      params: { token: await getToken() }
    });

    newSocket.connect();

    newSocket.onOpen(() => {
      console.log("Socket opened");
    });

    newSocket.onClose(() => {
      console.log("Connection dropped");
    });

    newSocket.onError((error) => {
      console.log("Socket error", error);
      console.error("There was an error with the connection");
    });

    setSocket(newSocket);

    const newChannel = newSocket.channel(`chat:${channelName.toLowerCase()}`);

    newChannel.on("presence_state", function (payload) {
      const currentlyOnlinePeople = Object.entries(payload).map(elem => ({
        username: elem[1].metas[0].name,
        id: elem[1].metas[0].phx_ref
      }));
      setOnlineUsers(currentlyOnlinePeople);
    });

    newChannel.on("presence_diff", function (payload) {
      // Implement logic for updating online users when someone joins or leaves
    });

    newChannel.on("new_message", function (payload) {
      setMessages([...messages, payload]);
    });

    newChannel.join()
      .receive("ok", () => console.log("Channel joined"))
      .receive("error", () => console.log("Failed to join"))
      .receive("timeout", () => console.log("Encountering network connectivity problems. Waiting for the connection to stabilize."));

    setChannel(newChannel);
  };

  const getToken = async () => {
    try {
      let token = await AsyncStorage.getItem('token');
      if (token) {
        return token;
      }
  
      let id = await AsyncStorage.getItem('id');
      let name = await AsyncStorage.getItem('name');
  
      if (!id || !name) {
        // If id or name doesn't exist, generate random strings
        id = generateRandomString();
        name = generateRandomString();
  
        // Store generated id and name in AsyncStorage
        await AsyncStorage.setItem('id', id);
        await AsyncStorage.setItem('name', name);
      }
  
      const body = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: '27fd6f9296c71b4a2f2ad1f533e6b5c075c005bbdeac76923e',
          user: {
            id,
            name,
            email: 'nick@gmail.com',
            avatar: 'https://test.com/user/profile.jpg',
            moderator: true,
          },
        }),
      };
  
      const response = await fetch('https://api.sariska.io/api/v1/misc/generate-token', body);
      if (response.ok) {
        const json = await response.json();
        token = json.token;
        await AsyncStorage.setItem('token', token);
        return token;
      } else {
        console.log(response.status);
      }
    } catch (error) {
      console.log('error', error);
    }
  };
  

  const sendMessage = () => {
    if (!message.trim()) {
      return; // Don't send empty messages
    }

    if (channel) {
      channel.push('new_message', {
        content: message,
        content_type: "text"
      });
      setMessage(''); // Clear the message input field after sending
    }
  };

  return (
<View style={{ flex: 1, flexDirection: 'column' }}>
  <FlatList
    data={onlineUsers}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'red', marginRight: 5 }}>
          <Text style={{ textAlign: 'center', lineHeight: 30 }}>{item.username[0]}</Text>
        </View>
        <Text>{item.username}</Text>
      </View>
    )}
  />
  <FlatList
    data={messages}
    keyExtractor={(item, index) => index.toString()}
    renderItem={({ item }) => (
      <View>
        <Text>{item.content}</Text>
      </View>
    )}
  />
  <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TextInput
        placeholder="Type your message"
        style={{ flex: 1, borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, height: 30, marginRight: 10 }}
        value={message}
        onChangeText={setMessage}
      />
      <TouchableOpacity onPress={sendMessage}>
        <Text style={{ padding: 10, backgroundColor: 'blue', color: 'white', borderRadius: 5 }}>Send</Text>
      </TouchableOpacity>
    </View>
  </View>
</View>

  );
}

export default SuperChat;
