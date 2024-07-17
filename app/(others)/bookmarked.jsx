import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebase.config';
import { getDoc, doc, deleteDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { icons } from "../../constants";

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
        return { id: petId, ...petDoc.data(), pinned: false }; // Add pinned property
      });

      const petDetails = await Promise.all(petDetailsPromises);
      setBookmarkedPets(petDetails);
    } catch (error) {
      console.error('Error fetching bookmarked pets: ', error);
    }
  };

  const pinPet = async (petId) => {
    try {
      const updatedPets = [...bookmarkedPets];
      const petIndex = updatedPets.findIndex(pet => pet.id === petId);
      if (petIndex !== -1) {
        updatedPets[petIndex].pinned = !updatedPets[petIndex].pinned;
        // Move pinned pet to the top of the list
        const pinnedPet = updatedPets.splice(petIndex, 1)[0];
        updatedPets.unshift(pinnedPet);
        setBookmarkedPets(updatedPets);
        // Update Firestore with new pinned status if needed
        // Example:
        const petRef = doc(db, 'petListing', petId);
        await updateDoc(petRef, { pinned: updatedPets[petIndex].pinned });
      }
    } catch (error) {
      console.error('Error pinning pet: ', error);
    }
  };

  const deletePet = async (petId) => {
    try {
      const confirmDelete = await new Promise((resolve, reject) => {
        Alert.alert(
          'Confirm Delete',
          'Are you sure you want to delete this bookmarked pet?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => resolve(true),
            },
          ],
          { cancelable: true }
        );
      });

      if (confirmDelete) {
        // Delete from local state
        const updatedPets = bookmarkedPets.filter(pet => pet.id !== petId);
        setBookmarkedPets(updatedPets);

        // Delete from Firestore collection
        const user = auth.currentUser;
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          bookmarkedPets: arrayRemove(petId),
        });
        }
    } catch (error) {
      console.error('Error deleting pet: ', error);
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
        <View className="w-full justify-start px-4 py-10">
          <Text className="text-turqoise font-gb mt-4 text-5xl mb-4 ">
            Bookmarked pets
          </Text>

          <View className="flex-row items-center border-b border-turqoise">
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
            <View key={pet.id} className="flex-row items-center border-turqoise mb-2">
              <TouchableOpacity onPress={() => pinPet(pet.id)} className="bg-darkBrown flex items-center justify-center p-2">
                <Text className="text-white text-xl">pin</Text>
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="bg-darkBrown text-center text-xl font-plight text-white p-2">
                  {pet.name}
                </Text>
                <Text className="bg-darkBrown text-center text-xl font-plight text-white p-2">
                  {pet.username}
                </Text>
                <Text className={`text-xl font-plight p-2 ${pet.status === "available" ? 'bg-green-500 text-black' : 'bg-red text-white'}`}>
                  {pet.status}
                </Text>
              </View>
              <TouchableOpacity onPress={() => deletePet(pet.id)} className="bg-darkBrown p-2">
                <Text className="text-xl font-plight text-red">Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Bookmarked;
