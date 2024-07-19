import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../firebase.config';
import { getDocs, doc, deleteDoc, updateDoc, arrayRemove, collection } from 'firebase/firestore';
import { icons } from "../../constants";
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
          const shelterData = snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }));
          setShelters(shelterData);
        } catch (error) {
          console.error('Error fetching shelters:', error);
        }
      };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchShelters();
        setRefreshing(false);
      };

    return (
        <SafeAreaView className="bg-bgc h-full">
          <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
            <View className="w-full justify-start px-4 py-10 ">
                <View className="border-b">
                    <Text className="text-turqoise font-gb text-5xl ">
                        Chat with a shelter
                    </Text>
                </View>

            {shelters.map((shelter) => (
            <View key={shelter.id}>
              <View className="justify-center mt-4">
                <EmailButton
                  title={shelter.data.username}
                  containerStyles="bg-darkBrown p-3 rounded-xl"
                  textStyles="text-center"
                  handlePress={() =>
                    router.push({ pathname: 'livechat', params: { id: shelter.id }})
                  }
                />
              </View>
            </View>
            ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      );
}

export default livechatlist

