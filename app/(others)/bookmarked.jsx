import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import EmailButton from '../../components/EmailButton';
import LikeButton from '../../components/CustomLikeButton';
import CustomWebsiteButton from '../../components/CustomWebsiteButton';
import { db } from '../../firebase.config';
import { getDocs, collection } from 'firebase/firestore';

const bookmarked = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);


  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShelters();
    await fetchPosts();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-bgc h-full">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="w-full h-full justify-start px-4 py-10">
          <View className="justify-start flex-center items-center justify-center">
            <Text className="text-turqoise font-gb mt-4 text-5xl mb-4 ">
              Bookmarked pets
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default bookmarked;
