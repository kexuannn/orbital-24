import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { db , auth} from '../../firebase.config';
import { getDoc, doc, collection } from 'firebase/firestore';

const bookmarked = () => {
  const router = useRouter();
  const [bookmarkedPets, setBookmarkedPets] = useState([]);

  useEffect(() => {
    const fetchBookmarkedPets = async () => {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const { bookmarkedPets } = userData;

          setBookmarkedPets(bookmarkedPets || []); 
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching bookmarked pets:', error);
      }
    };
    fetchBookmarkedPets();
  }, []);
  

  return (
    <SafeAreaView className="bg-bgc h-full">
      <ScrollView>
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


        </View>

        
        
      </ScrollView>
    </SafeAreaView>
  );
};

export default bookmarked;
