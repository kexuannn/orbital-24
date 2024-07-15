import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebase.config';
import { getDoc, doc } from 'firebase/firestore';


const Bookmarked = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedPets, setBookmarkedPets] = useState([]);

  useEffect(() => {
    fetchBookmarkedPets();
  }, []);

  const fetchBookmarkedPets = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No user is signed in');
        return;
      }
      const userId = user.uid;

      // Fetch the user's document to get the bookmarkedPets array
      const userDoc = await getDoc(doc(db, 'users', userId));
      const bookmarkedPetsArray = userDoc.data().bookmarkedPets || [];

      // Fetch details of each bookmarked pet
      const petDetailsPromises = bookmarkedPetsArray.map(async (petId) => {
        const petDoc = await getDoc(doc(db, 'petListing', petId));
        return { id: petId, ...petDoc.data() };
      });

      const petDetails = await Promise.all(petDetailsPromises);
      setBookmarkedPets(petDetails);
    } catch (error) {
      console.error('Error fetching bookmarked pets: ', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookmarkedPets();
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

          <View className="flex-row justify-center items-center border-b border-turqoise">
            <Text className="flex-1 text-center text-xl font-plight text-turqoise">
              Name
            </Text>
            <Text className="flex-1 text-center text-xl font-plight text-turqoise">
              Shelter
            </Text>
            <Text className="flex-1 text-center text-xl font-plight text-turqoise">
              Status
            </Text>
          </View>

          {bookmarkedPets.map((pet) => (
            <View key={pet.id} className="flex-row justify-center items-center border-turqoise mb-2">
              <Text className="bg-darkBrown flex-1 text-center text-xl font-plight text-white p-2">
                {pet.name}
              </Text>
              
              <Text className="bg-darkBrown flex-1 text-center text-xl font-plight text-white p-2">
                {pet.username}
              </Text>

              <Text className={`flex-1 text-center text-xl font-plight  ${pet.status=="available" ? 'text-black bg-green-500' : 'text-white bg-red'} p-2`}>
                {pet.status}
              </Text>
            </View>
          ))}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Bookmarked;
