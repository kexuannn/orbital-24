import React, { useState, useEffect } from 'react';
import { View, Text, Image, RefreshControl, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HorizontalBar from '../../components/CustomHorizontalBar';
import { db, auth } from '../../firebase.config';
import { doc, getDocs, collection, getDoc } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';
import BackButton from '../../components/CustomBackButton';
import LikeButton from '../../components/CustomLikeButton';
import CommentSection from '../../components/Comments';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

const ViewSuccess = () => {
  const route = useRoute();
  const { optionalParameter } = route.params;

  const [success, setSuccess] = useState([]);
  const [shelterData, setShelterData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSuccess();
    fetchShelterData();
  }, [optionalParameter]);

  const fetchSuccess = async () => {
    try {
      const postsCollection = collection(db, 'success');
      const snapshot = await getDocs(postsCollection);
      const successData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }))
        .filter((success) => success.data.userId === optionalParameter)
        .sort((a, b) => b.data.createdAt.toDate().getTime() - a.data.createdAt.toDate().getTime());

      setSuccess(successData);
    } catch (error) {
      console.error('Error fetching success data:', error);
    }
  };

  const fetchShelterData = async () => {
    try {
      if (!optionalParameter) {
        console.error('ID is undefined or null');
        return;
      }

      const docRef = doc(db, 'shelters', optionalParameter);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setShelterData(data); // Set all shelter data to state
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching shelter data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSuccess();
    await fetchShelterData();
    setRefreshing(false);
  };

  const navigationData = [
    {
      id: '1',
      title: 'Pet Listing',
      screen: 'viewhome', // Adjust screen names as needed
    },
    {
      id: '2',
      title: 'Fundraising Events',
      screen: 'viewfundraising',
    },
    {
      id: '3',
      title: 'Success Stories',
      screen: 'viewsuccess',
    },
  ];

  const renderItem = ({ item }) => (
    <View key={item.id} className="bg-white mt-4">
      <View className="justify-start items-start mt-2">
        <View className="flex-row justify-center items-center ml-2">
          <Image
            source={{ uri: item.data.profilePicture }}
            style={{
              width: 40,
              height: 40,
              resizeMode: 'contain',
              borderRadius: 20,
            }}
          />
          <Text className="text-turqoise font-pbold text-lg ml-2">
            {item.data.username}
          </Text>
        </View>

        <View className="mb-2">
          <Image
            source={{ uri: item.data.imageUrl }}
            style={{
              width: screenWidth - 32, // Width of the screen minus padding
              height: screenWidth - 32, // Maintain aspect ratio
              resizeMode: 'cover',
              marginVertical: 10,
            }}
          />
        </View>

        <View className="ml-2 mb-2">
          <LikeButton postId={item.id} collectionName="success" initialLikes={(item.data.likedBy && item.data.likedBy.length) || 0} />
        </View>

        <View className="ml-2 mb-2">
          <Text className="text-turqoise font-pbold text-lg">
            {item.data.username}
          </Text>
          <Text className="text-darkBrown font-pregular text-md ml-3 flex-wrap" style={{ maxWidth: screenWidth - 32 }}>
            {item.data.caption}
          </Text>
        </View>
      </View>

      <View className="mb-4">
        <CommentSection postId={item.id} />
      </View>
    </View>
  );

  const renderHeader = () => (
    <View>
      <View className="flex-row items-center">
        <BackButton 
          containerStyles="p-3 rounded-xl mb-4" 
          textStyles="text-turqoise" 
        />
        <View className="flex-1 items-center">
          <Text className="text-turqoise font-gb text-5xl text-center mr-12">
            {shelterData?.username}
          </Text>
        </View>
      </View>
      <HorizontalBar data={navigationData} optionalParameter={optionalParameter} />
    </View>
  );

  return (
    <SafeAreaView className="bg-bgc flex-1">
      <FlatList
        data={success}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ 
          paddingHorizontal: 16, 
          paddingBottom: 20, 
          paddingTop: 40
        }}
      />
    </SafeAreaView>
  );
};

export default ViewSuccess;
