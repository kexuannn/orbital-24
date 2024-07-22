import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ref, onValue, push } from 'firebase/database';
import { db, database, auth } from '../../firebase.config'; 
import { doc, getDoc } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import call from 'react-native-phone-call';  // Import phone call library

const ChatScreen = () => {
  const route = useRoute();
  const { id } = route.params;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState('');
  const [shelterName, setShelterName] = useState('');
  const [userId, setUserId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // To store phone number
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
        const shelterData = shelterDoc.data();
        setShelterName(shelterData.username);
        setPhoneNumber(shelterData.number); // Assuming phone number is stored in Firestore
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

  const makeCall = () => {
    const args = {
      number: phoneNumber, // Phone number to call
      prompt: true, // Display the native dialer with a confirmation prompt
    };
    call(args).catch(console.error); // Handle errors if the call cannot be made
  };

  return (
    <SafeAreaView className="bg-bgc h-full">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 p-2 bg-bgc">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xl font-pbold mt-4 text-turqoise ml-2">
              You are currently chatting with {shelterName}
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
