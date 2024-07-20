import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../constants';
import HorizontalBar from '../../components/CustomHorizontalBar';
import { db, auth } from '../../firebase.config';
import { doc, getDocs, collection, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';
import LikeButton from '../../components/CustomLikeButton';
import BackButton from '../../components/CustomBackButton';
import EmailButton from '../../components/EmailButton';

const ViewHome = () => {
  const route = useRoute();
  const { id } = route.params;

  const [pet, setPet] = useState([]);
  const [shelterData, setShelterData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedPets, setBookmarkedPets] = useState([]);
  const [detailsVisibility, setDetailsVisibility] = useState({});

  useEffect(() => {
    fetchPet();
    fetchShelterData();
    fetchBookmarkedPets();
  }, [id]);

  const fetchPet = async () => {
    try {
      const postsCollection = collection(db, 'petListing');
      const snapshot = await getDocs(postsCollection);
      const petData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          data: doc.data(),
        })).filter((pet) => pet.data.userId === id);

      setPet(petData);
    } catch (error) {
      console.error('Error fetching pet listings:', error);
    }
  };

  const fetchShelterData = async () => {
    try {
      const docRef = doc(db, 'shelters', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists) {
        const data = docSnap.data();
        setShelterData(data); // Set all shelter data to state
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching shelter data:', error);
    }
  };

  const fetchBookmarkedPets = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists) {
          const userData = docSnap.data();
          const userBookmarkedPets = userData.bookmarkedPets || [];
          setBookmarkedPets(userBookmarkedPets);
        }
      }
    } catch (error) {
      console.error('Error fetching bookmarked pets:', error);
    }
  };

  const toggleBookmark = async (postId) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);

        let updatedBookmarkedPets = [];

        if (bookmarkedPets) {
          if (bookmarkedPets.includes(postId)) {
            await updateDoc(userDocRef, {
              bookmarkedPets: arrayRemove(postId),
            });
            updatedBookmarkedPets = bookmarkedPets.filter((petId) => petId !== postId);
          } else {
            await updateDoc(userDocRef, {
              bookmarkedPets: arrayUnion(postId),
            });
            updatedBookmarkedPets = [...bookmarkedPets, postId];
          }
        } else {
          await updateDoc(userDocRef, {
            bookmarkedPets: [postId],
          });
          updatedBookmarkedPets = [postId];
        }

        setBookmarkedPets(updatedBookmarkedPets);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPet();
    await fetchShelterData();
    setRefreshing(false);
  };

  const toggleDetails = (postId) => {
    setDetailsVisibility((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId]
    }));
  };

  const navigationData = [
    {
      id: '1',
      title: 'Pet Listing',
      screen: 'viewhome',
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
        <View className="w-full h-full justify-start px-4 py-10 ">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <BackButton 
              containerStyles="p-3 rounded-xl mb-4" 
              textStyles="text-turqoise" 
            />
            <Text className="pl-20 pb-18 text-turqoise font-gb mt-4 text-5xl mb-4">
              {shelterData?.username}
            </Text>
          </View>

          <HorizontalBar data={navigationData} optionalParameter={id} />

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

                <View className="mt-2 mb-2">
                  <Image
                    source={{ uri: p.data.imageUrl }}
                    style={{
                      width: 358,
                      height: 400,
                    }}
                  />
                </View>

                <View className='flex flex-row ml-2 mb-2'>
                  <LikeButton postId={p.id} collectionName={"petListing"} initialLikes={(p.data.likedBy && p.data.likedBy.length) || 0} />
                  <TouchableOpacity onPress={() => toggleBookmark(p.id)} style={{ marginLeft: 10 }}>
                    <Image 
                      source={icons.bookmark} 
                      style={{ 
                        width: 20, 
                        height: 20, 
                        tintColor: bookmarkedPets.includes(p.id) ? '#416F82' : 'gray' }} />
                  </TouchableOpacity>
                </View>

                <View className="flex flex-row ml-2 items-center mb-2">
                  <Text className="text-turqoise font-pbold text-lg">
                    {p.data.username}
                  </Text>
                  <Text className="text-darkBrown font-pregular text-lg ml-3">
                    {p.data.caption}
                  </Text>
                </View>

                <View>
                  <Text className="text-darkBrown font-pregular text-lg ml-2">
                      Status: {p.data.status}
                  </Text>
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

export default ViewHome;
