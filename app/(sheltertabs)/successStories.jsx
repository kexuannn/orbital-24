import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useRouter } from 'expo-router';

import EmailButton from '../../components/EmailButton';
import CustomWebsiteButton from '../../components/CustomWebsiteButton';
import HorizontalBar from '../../components/CustomHorizontalBar';
import LikeButton from '../../components/CustomLikeButton';
import { db, auth } from '../../firebase.config';
import { doc, getDocs, collection, getDoc } from "firebase/firestore";
import CommentSection from '../../components/Comments';

const Success = () => {
  const [success, setSuccess] = useState([]);
  const [shelterData, setShelterData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSuccess();
    fetchShelterData();
  }, []);

  const fetchSuccess = async () => {
    try {
      const postsCollection = collection(db, 'success');
      const snapshot = await getDocs(postsCollection);
      const successData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          data: doc.data()
        }))
        .filter((post) => post.data.userId === auth.currentUser.uid)
        .sort((a, b) => b.data.createdAt.toDate().getTime() - a.data.createdAt.toDate().getTime());

      setSuccess(successData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchShelterData = async () => {
    try {
      const shelter = auth.currentUser;
      const shelterId = shelter.uid;
      const docRef = doc(db, 'shelters', shelterId);

      const docSnap = await getDoc(docRef);

      if (docSnap.exists) {
        const data = docSnap.data();
        setShelterData(data);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching shelter data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSuccess();
    await fetchShelterData();
    setRefreshing(false);
  };

  const formatDate = (timestamp) => {
    if (timestamp) {
      const date = timestamp.toDate();
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'No Date';
  };

  const navigationData = [
    {
      id: '1',
      title: 'Pet Listing',
      screen: 'shelterHome',
    },
    {
      id: '2',
      title: 'Fundraising Events',
      screen: 'fundraising',
    },
    {
      id: '3',
      title: 'Success Stories',
      screen: 'successStories',
    },
    {
      id: '4',
      title: 'User Posts',
      screen: 'viewUserPosts',
    },
  ];

  const renderItem = ({ item }) => (
    <View key={item.id} className="bg-white mt-4">
      <View className='justify-start items-start mt-2'>
        <View className='flex-row justify-center items-center ml-2'>
          <Image
            source={{ uri: item.data.profilePicture }}
            style={{ width: 40, height: 40, resizeMode: 'contain', borderRadius: 20 }}
          />
          <Text className='text-turqoise font-pbold text-lg ml-2'>
            {item.data.username}
          </Text>
        </View>
        <View className='mt-2 mb-2'>
          <Image
            source={{ uri: item.data.imageUrl }}
            style={{ width: 358, height: 400 }}
          />
        </View>
        <View className='ml-2 mb-2'>
          <LikeButton postId={item.id} collectionName={"success"} initialLikes={(item.data.likedBy && item.data.likedBy.length) || 0} />
        </View>
        <View className='flex justify-start flex-row ml-2 items-center'>
          <Text className='text-turqoise font-pbold text-lg'>
            {item.data.username}
          </Text>
          <Text className='text-darkBrown font-pregular text-md ml-3'>
            {item.data.caption}
          </Text>
        </View>
        <Text className="text-darkBrown font-pregular text-xs ml-2">
          Posted on: {formatDate(item.data.createdAt)}
        </Text>
      </View>
      <View className='mb-4'>
        <CommentSection postId={item.id} />
      </View>
    </View>
  );

  const renderHeader = () => (
    <View>
      <View className='justify-start flex-center items-center'>
        <Text className="text-turqoise font-gb mt-4 text-5xl mb-4">
          {shelterData?.username}
        </Text>
      </View>
      <HorizontalBar data={navigationData} />
    </View>
  );

  return (
    <SafeAreaView className="bg-bgc h-full">
      <FlatList
        data={success}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
      />
    </SafeAreaView>
  );
}

export default Success;
