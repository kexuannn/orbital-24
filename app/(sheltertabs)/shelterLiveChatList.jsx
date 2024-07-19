import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ref, onValue } from 'firebase/database';
import { database, auth } from '../../firebase.config';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { db } from '../../firebase.config';
import EmailButton from '../../components/EmailButton';

const ShelterLiveChatList = () => {
  const router = useRouter();
  const [activeChats, setActiveChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState({}); // To store user names

  useEffect(() => {
    if (auth.currentUser) {
      fetchActiveChats(auth.currentUser.uid);
    } else {
      console.error('Shelter not authenticated');
    }
  }, []);

  const fetchActiveChats = async (shelterId) => {
    try {
      const chatsRef = ref(database, `chats`);
      onValue(chatsRef, async (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const chatIds = Object.keys(data).filter(chatId => chatId.includes(shelterId));
          const activeChats = chatIds.map(chatId => ({
            id: chatId,
            ...data[chatId],
          }));


          const userIds = activeChats.map(chat => {
            const otherId = chat.id.split('_').find(id => id !== shelterId);
            return otherId;
          });


          const userNamesMap = {};
          for (const userId of userIds) {
            const userDocRef = doc(db, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              userNamesMap[userId] = userData.username;
            } else {
              console.log('No such document for userId:', userId);
            }
          }


          setUserNames(userNamesMap);
          setActiveChats(activeChats);
        } else {
          console.log('No data found in chats.');
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error fetching active chats:', error);
      Alert.alert('Error', 'Failed to fetch active chats. Please try again.');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (auth.currentUser) {
      await fetchActiveChats(auth.currentUser.uid);
    }
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-bgc h-full">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="w-full justify-start px-4 py-10">
          <View className="border-b">
            <Text className="text-turqoise font-gb text-5xl">Active Chats</Text>
          </View>

          {loading ? (
            <ActivityIndicator size={50} color="grey" />
          ) : (
            activeChats.map((chat) => {
              const otherUserId = chat.id.split('_').find(id => id !== auth.currentUser.uid);
              const userName = userNames[otherUserId] || 'Unknown User';
              return (
                <View key={chat.id} className="mt-4">
                    <View className="justify-center mt-4">
                        <EmailButton
                        title= {userName}
                        containerStyles="bg-darkBrown p-3 rounded-xl"
                        textStyles="text-center"
                        handlePress={() =>
                            router.push({ pathname: 'shelterLivechat', params: { id: otherUserId }})
                        }
                        />
                    </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShelterLiveChatList;
