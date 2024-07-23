import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ref, onValue, push } from 'firebase/database';
import { db, database, auth } from '../../firebase.config'; 
import { doc, getDoc } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons'; 
import call from 'react-native-phone-call';  

const ShelterChatScreen = () => {
  const route = useRoute();
  const { id } = route.params;  
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState('');
  const [userName, setUserName] = useState('');
  const [shelterId, setShelterId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); 
  const flatListRef = useRef();

  useEffect(() => {
    if (auth.currentUser) {
      setShelterId(auth.currentUser.uid);
      fetchUserAndChatId(auth.currentUser.uid);
    } else {
      console.error("Shelter not authenticated");
    }
  }, [id]);

  const fetchUserAndChatId = async (currentShelterId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', id));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.username);
        setPhoneNumber(userData.contact); 
        const generatedChatId = generateChatId(currentShelterId, id);
        setChatId(generatedChatId);
        fetchMessages(generatedChatId);
      } else {
        console.error('User not found');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const generateChatId = (shelterId, userId) => {
    return shelterId < userId ? `${shelterId}_${userId}` : `${userId}_${shelterId}`;
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
          senderId: shelterId,
        });
        setMessage('');
      } catch (error) {
        console.error("Error sending message:", error);
        Alert.alert("Error", "Failed to send message. Please try again.");
      }
    }
  };

  const makeCall = () => {
    if (!phoneNumber) {
      Alert.alert("Error", "No phone number available.");
      return;
    }

    const args = {
      number: phoneNumber,
      prompt: true,
    };
    call(args).catch(console.error);
  };

  return (
    <SafeAreaView className="bg-bgc h-full">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 p-2 bg-bgc">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xl font-pbold mb-2.5 mt-4">
              You are currently chatting with {userName}
            </Text>
            <TouchableOpacity onPress={makeCall} className="p-2">
              <Icon name="call" size={24} color="green" />
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size={50} color="grey" />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => (
                <View className={`p-2.5 rounded-md my-1.5 max-w-[75%] ${item.senderId === shelterId ? 'bg-[#DCF8C6] self-end' : 'bg-[#f1f1f1] self-start'}`}>
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
              className="flex-1 border border-gray-300 p-2.5 rounded-md mr-2.5 font-pmedium"
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
            />
            <TouchableOpacity
              onPress={sendMessage}
              className="p-2 rounded-md"
            >
              <Text className="text-turqoise text-center font-pmedium">
                Send
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ShelterChatScreen;