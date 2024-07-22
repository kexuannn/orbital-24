import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, database, auth } from '../../firebase.config';
import { getDocs, collection, doc, getDoc } from 'firebase/firestore';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import { icons } from '../../constants';
import EmailButton from '../../components/EmailButton';
import { useRouter } from 'expo-router';

const livechatlist = () => {
  const router = useRouter();
  const [shelters, setShelters] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      const sheltersCollection = collection(db, 'shelters');
      const snapshot = await getDocs(sheltersCollection);
      const shelterData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const latestMessageTimestamp = await fetchLatestMessageTimestamp(auth.currentUser.uid, doc.id);
          return {
            id: doc.id,
            data,
            latestMessageTimestamp,
          };
        })
      );

      shelterData.sort((a, b) => b.latestMessageTimestamp - a.latestMessageTimestamp);

      setShelters(shelterData);
    } catch (error) {
      console.error('Error fetching shelters:', error);
    }
  };

  const fetchLatestMessageTimestamp = async (userId, shelterId) => {
    try {
      const chatId = generateChatId(userId, shelterId);
      const messagesRef = ref(database, `chats/${chatId}`);
      const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(1));
      const snapshot = await get(messagesQuery);

      if (snapshot.exists()) {
        const messageData = Object.values(snapshot.val())[0];
        return new Date(messageData.timestamp).getTime();
      }

      return 0; // No messages, so return 0
    } catch (error) {
      console.error('Error fetching latest message timestamp:', error);
      return 0;
    }
  };

  const generateChatId = (userId, shelterId) => {
    return userId < shelterId ? `${userId}_${shelterId}` : `${shelterId}_${userId}`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShelters();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-bgc h-full">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="w-full justify-start px-4 py-10 ">
          <View className="border-b">
            <Text className="text-turqoise font-gb text-5xl ">
              Chat with a shelter
            </Text>
          </View>

          <Text className="text-turqoise font-pregular text-xl mt-4 ">
              Recent chats:
          </Text>

          {shelters.map((shelter) => (
            <View key={shelter.id}>
              <View className="justify-center mt-4">
                <EmailButton
                  title={shelter.data.username}
                  containerStyles="bg-darkBrown p-3 rounded-xl"
                  textStyles="text-center"
                  handlePress={() =>
                    router.push({ pathname: 'livechat', params: { id: shelter.id } })
                  }
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default livechatlist;
