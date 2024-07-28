import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HorizontalBar from '../../components/CustomHorizontalBar';
import { db, auth } from '../../firebase.config';
import { doc, getDocs, collection, getDoc } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';
import LikeButton from '../../components/CustomLikeButton';
import BackButton from '../../components/CustomBackButton';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

const viewFundraising = () => {
  const route = useRoute();
  const { optionalParameter } = route.params;

  const [fundraising, setFundraising] = useState([]);
  const [shelterData, setShelterData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFundraising();
    fetchShelterData();
  }, [optionalParameter]);

  const fetchFundraising = async () => {
    try {
      const postsCollection = collection(db, 'fundraising');
      const snapshot = await getDocs(postsCollection);
      const fundraisingData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }))
        .filter((fundraising) => fundraising.data.userId === optionalParameter);

      const sortedData = fundraisingData.sort((a, b) =>
        b.data.createdAt.toDate().getTime() - a.data.createdAt.toDate().getTime()
      );

      setFundraising(sortedData);
    } catch (error) {
      console.error('Error fetching fundraising data:', error);
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
    await fetchFundraising();
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

  return (
    <SafeAreaView className="bg-bgc h-full">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="w-full h-full justify-start px-4 py-10">
          <View className='flex-row items-center'>
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

          <HorizontalBar data={navigationData} optionalParameter={optionalParameter}/>

          {fundraising.map((fund) => (
            <View key={fund.id} className="bg-white mt-4">
              <View className="justify-start items-start mt-2">
                <View className="flex-row justify-center items-center ml-2">
                  <Image
                    source={{ uri: fund.data.profilePicture }}
                    style={{
                      width: 40,
                      height: 40,
                      resizeMode: 'contain',
                      borderRadius: 20,
                    }}
                  />
                  <Text className="text-turqoise font-pbold text-lg ml-2">
                    {fund.data.username}
                  </Text>
                </View>

                <View className="mb-2">
                  <Image
                    source={{ uri: fund.data.imageUrl }}
                    style={{
                    width: screenWidth - 32, // Width of the screen minus padding
                    height: (screenWidth - 32), // Maintain aspect ratio
                    resizeMode: 'cover',
                    marginVertical: 10,
                    }}
                  />
                </View>

                <View className='ml-2 mb-2'>
                  <LikeButton postId={fund.id} collectionName={"fundraising"} initialLikes={(fund.data.likedBy && fund.data.likedBy.length) || 0} />
                </View>

                <View className='ml-2 mb-2'>
                  <Text className='text-turqoise font-pbold text-lg'>
                    {fund.data.username}
                  </Text>
                  <Text className='text-darkBrown font-pregular text-md ml-3 flex-wrap' style={{ maxWidth: screenWidth - 32 }}>
                    {fund.data.caption}
                  </Text>
                </View>
                <Text className="text-darkBrown font-pregular text-xs ml-2 mb-2">
                    Posted on: {formatDate(fund.data.createdAt)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default viewFundraising;
