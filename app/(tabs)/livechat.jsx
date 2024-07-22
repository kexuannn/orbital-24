import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Button, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ref, onValue, push } from 'firebase/database';
import { db, database, auth } from '../../firebase.config'; 
import { doc, getDoc } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatScreen = () => {
  const route = useRoute();
  const { id } = route.params;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState('');
  const [shelterName, setShelterName] = useState('');
  const [userId, setUserId] = useState('');
  const flatListRef = useRef();

  useEffect(() => {
    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
      fetchShelterAndChatId(auth.currentUser.uid);
    } else {
      console.error("User not authenticated");
    }
  }, [id]);

  const fetchShelterAndChatId = async (currentUserId) => {
    try {
      const shelterDoc = await getDoc(doc(db, 'shelters', id));
      if (shelterDoc.exists()) {
        setShelterName(shelterDoc.data().username);
        const generatedChatId = generateChatId(currentUserId, id);
        setChatId(generatedChatId);
        fetchMessages(generatedChatId);
      } else {
        console.error('Shelter not found');
      }
    } catch (error) {
      console.error('Error fetching shelter data:', error);
    }
  };

  const generateChatId = (userId, shelterId) => {
    return userId < shelterId ? `${userId}_${shelterId}` : `${shelterId}_${userId}`;
  };

  const fetchMessages = (chatId) => {
    const messagesRef = ref(database, `chats/${chatId}`);
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const parsedMessages = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setMessages(parsedMessages);
      setLoading(false);
      flatListRef.current.scrollToEnd({ animated: true });
    });
  };

  const sendMessage = async () => {
    if (message.trim()) {
      try {
        const messagesRef = ref(database, `chats/${chatId}`);
        await push(messagesRef, {
          text: message,
          timestamp: new Date().toISOString(),
          senderId: userId,
        });
        setMessage('');
      } catch (error) {
        console.error("Error sending message:", error);
        Alert.alert("Error", "Failed to send message. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView className="bg-bgc h-full">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 p-2 bg-bgc">
          <Text className="text-xl font-pbold mb-2.5 mt-4 text-turqoise ml-2">
            You are currently chatting with {shelterName}
          </Text>
          {loading ? (
            <ActivityIndicator size={50} color="grey" />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => (
                <View className={`p-2.5 rounded-md my-1.5 max-w-[75%] ${item.senderId === userId ? 'bg-[#DCF8C6] self-end' : 'bg-[#f1f1f1] self-start'}`}>
                  <Text className="font-pmedium">{item.text}</Text>
                  <Text className="text-xs text-gray-500 text-right mt-1.5">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              )}
              keyExtractor={item => item.id}
              onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
            />
          )}
          <View className="flex-row items-center my-1.5">
            <TextInput
              className="flex-1 border border-darkBrown p-2.5 rounded-md mr-2.5 font-pmedium"
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor='#463939'
            />
            <TouchableOpacity
              onPress={sendMessage}
              className="p-2 rounded-md bg-turqoise"
            >
              <Text className="text-white text-center font-pmedium">
                Send
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
