import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmailButton from '../../components/EmailButton';
import HorizontalBar from '../../components/CustomHorizontalBar';
import LikeButton from '../../components/CustomLikeButton';
import { db, auth } from '../../firebase.config';
import { doc, getDocs, collection, getDoc } from 'firebase/firestore';

const PetListing = () => {
  const [pet, setPet] = useState([]);
  const [shelterData, setShelterData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchPet();
    fetchShelterData();
  }, []);

  const fetchPet = async () => {
    try {
      const postsCollection = collection(db, 'petListing');
      const snapshot = await getDocs(postsCollection);
      const petData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          data: doc.data(),
        })).filter((pet) => pet.data.userId === auth.currentUser.uid);

      setPet(petData);
    } catch (error) {
      console.error('Error fetching pet listings:', error);
    }
  };

  const fetchShelterData = async () => {
    try {
      const shelter = auth.currentUser;
      const shelterId = shelter.uid;

      const docRef = doc(db, 'shelters', shelterId);

      // Get the document snapshot
      const docSnap = await getDoc(docRef);

      if (docSnap.exists) {
        const data = docSnap.data();
        setShelterData(data);
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching shelter data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPet();
    await fetchShelterData();
    setRefreshing(false);
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

  return (
    <SafeAreaView className="bg-bgc h-full">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="w-full h-full justify-start px-4 py-10">
          <View className="justify-start flex-center items-center">
            <Text className="text-turqoise font-gb mt-4 text-5xl mb-4">
              {shelterData?.username}
            </Text>
          </View>
          <HorizontalBar data={navigationData} />

          {pet.reverse().map((p) => (
            <View key={p.id} className="bg-white mt-4">
              <View className="justify-start items-start mt-2">
                <View className="flex-row justify-center items-center ml-2">
                  <Image
                    source={{ uri: p.data.profilePicture }}
                    style={{
                      width: 40,
                      height: 40,
                      resizeMode: 'contain',
                      borderRadius: 20,
                    }}
                  />
                  <Text className="text-turqoise font-pbold text-lg ml-2">
                    {p.data.username}
                  </Text>
                </View>

                <View className="mt-2 mb-1">
                  <Image
                    source={{ uri: p.data.imageUrl }}
                    style={{
                      width: 358,
                      height: 400,
                    }}
                  />
                </View>

                <View className='ml-2 mb-2'>
                  <LikeButton postId={p.id} collectionName={"petListing"} initialLikes={(p.data.likedBy && p.data.likedBy.length) || 0} />
                </View>

                <View className="flex flex-row ml-2 items-center mb-2">
                  <Text className="text-turqoise font-pbold text-lg">
                    {p.data.username}
                  </Text>
                  <Text className="text-darkBrown font-pregular text-lg ml-3">
                    {p.data.caption}
                  </Text>
                </View>

                <View className="w-full justify-start px-4 mb-4">
                  <EmailButton
                    title= {showDetails ? 'Hide Details' : 'Show Details'}
                    handlePress={() => setShowDetails(!showDetails)}
                    containerStyles="mt-7 bg-turqoise"
                  />
                </View>

 


                {showDetails && (
                  <View className="ml-2 mb-2">
                    <Text className="text-darkBrown font-pregular text-lg">
                      Name: {p.data.name}
                    </Text>
                    <Text className="text-darkBrown font-pregular text-lg">
                      Age: {p.data.age}
                    </Text>
                    <Text className="text-darkBrown font-pregular text-lg">
                      Species: {p.data.species}
                    </Text>
                    <Text className="text-darkBrown font-pregular text-lg">
                      Sex: {p.data.sex}
                    </Text>
                    <Text className="text-darkBrown font-pregular text-lg">
                      Breed: {p.data.breed}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PetListing;
