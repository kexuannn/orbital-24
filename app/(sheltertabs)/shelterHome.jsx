import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DeleteButton from '../../components/CustomDeletePostButton';
import EmailButton from '../../components/EmailButton';
import HorizontalBar from '../../components/CustomHorizontalBar';
import LikeButton from '../../components/CustomLikeButton';
import { db, auth } from '../../firebase.config';
import { doc, getDocs, collection, getDoc, updateDoc } from 'firebase/firestore';

const { width: screenWidth } = Dimensions.get('window');

const PetListing = () => {
  const [pet, setPet] = useState([]);
  const [shelterData, setShelterData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [detailsVisibility, setDetailsVisibility] = useState({});

  useEffect(() => {
    fetchPet();
    fetchShelterData();
  }, []);

  const toggleDetails = (postId) => {
    setDetailsVisibility((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId]
    }));
  };

  const fetchPet = async () => {
    try {
      const postsCollection = collection(db, 'petListing');
      const snapshot = await getDocs(postsCollection);
      const petData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }))
        .filter((pet) => pet.data.userId === auth.currentUser.uid)
        .sort((a, b) => b.data.createdAt.toDate().getTime() - a.data.createdAt.toDate().getTime()); // Sort posts by createdAt
  
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
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
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

  const togglePetStatus = async (petId, currentStatus) => {
    try {
      let newStatus;
      switch (currentStatus) {
        case 'available':
          newStatus = 'pending adoption';
          break;
        case 'pending adoption':
          newStatus = 'adopted';
          break;
        case 'adopted':
        default:
          newStatus = 'available';
          break;
      }
      const petDocRef = doc(db, 'petListing', petId);
      await updateDoc(petDocRef, { status: newStatus });

      setPet((prevPets) =>
        prevPets.map((pet) =>
          pet.id === petId ? { ...pet, data: { ...pet.data, status: newStatus } } : pet
        )
      );
    } catch (error) {
      console.error('Error updating pet status:', error);
      Alert.alert('Error updating pet status. Please try again.');
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'adopted':
        return 'red';
      case 'pending adoption':
        return 'blue';
      default:
        return 'black';
    }
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

          {pet.map((p) => (
            <View key={p.id} className="bg-white mt-4 flex-1">
              <View className="justify-start items-start mt-2">
                <View className="flex-row justify-between items-center ml-2">
                  <View className="flex-row items-center">
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

                  <DeleteButton
                    collectionName="petListing" 
                    docId={p.id}
                    containerStyles="bg-red ml-2 w-20" 
                    textStyles="text-white font-pbold"
                    isLoading={false} 
                  />
                </View>

                <View className="mt-2 mb-1">
                  <Image
                    source={{ uri: p.data.imageUrl }}
                    style={{
                      width: screenWidth - 32, // Width of the screen minus padding
                      height: (screenWidth - 32), // Maintain aspect ratio
                      resizeMode: 'cover',
                      marginVertical: 10,
                    }}
                  />
                </View>

                <View className='ml-2 mb-2'>
                  <LikeButton postId={p.id} collectionName={"petListing"} initialLikes={(p.data.likedBy && p.data.likedBy.length) || 0} />
                </View>

                <View className='ml-2 mb-2'>
                  <Text className='text-turqoise font-pbold text-lg'>
                    {p.data.username}
                  </Text>
                  <Text className='text-darkBrown font-pregular text-md ml-3 flex-wrap' style={{ maxWidth: screenWidth - 32 }}>
                    {p.data.caption}
                  </Text>
                </View>

                <Text className="text-darkBrown font-pregular text-xs ml-2">
                  Posted on: {formatDate(p.data.createdAt)}
                </Text>

                <View className="flex-row justify-center items-center ml-2 mt-2">
                  <Text className="text-turqoise font-pbold text-lg">
                    Status: 
                    <Text style={{ color: getStatusColor(p.data.status) }}> {p.data.status}</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => togglePetStatus(p.id, p.data.status)}
                    className="bg-[#416F82] p-2.5 rounded ml-2"
                  >
                    <Text className="text-white font-poppins-regular">
                      Toggle Status
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="w-full justify-start px-4 mb-4">
                  <EmailButton
                    title={detailsVisibility[p.id] ? 'Hide Details' : 'Show Details'}
                    handlePress={() => toggleDetails(p.id)}
                    containerStyles="mt-7 bg-turqoise"
                  />
                </View>

                {detailsVisibility[p.id] && (
                  <View className="ml-2 mb-2">
                    <Text className="text-darkBrown font-pregular text-lg">
                      Name: {p.data.name}
                    </Text>
                    <Text className="text-darkBrown font-pregular text-lg">
                      Age (in years): {p.data.age}
                    </Text>
                    <Text className="text-darkBrown font-pregular text-lg">
                      Sex: {p.data.sex}
                    </Text>
                    <Text className="text-darkBrown font-pregular text-lg">
                      Species: {p.data.species}
                    </Text>
                    <Text className="text-darkBrown font-pregular text-lg">
                      Breed: {p.data.breed}
                    </Text>
                    <Text className="text-darkBrown font-pregular text-lg">
                      Property Type: {p.data.property}
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
