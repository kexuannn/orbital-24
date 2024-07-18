import { View, Text, ScrollView, Image, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { useRouter } from 'expo-router';

import SearchBar from '../../components/SearchBar'
import { db, auth } from '../../firebase.config'
import LikeButton from '../../components/CustomLikeButton'
import { icons } from '../../constants'
import EmailButton from '../../components/EmailButton'

const Search = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedPets, setBookmarkedPets] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [userData, setUserData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        } else {
          console.log('No such user!');
        }
      } else {
        console.log('No user is signed in.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchBookmarkedPets = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          const userBookmarkedPets = userData.bookmarkedPets || [];
          setBookmarkedPets(userBookmarkedPets);
        }
      }
    } catch (error) {
      console.error('Error fetching bookmarked pets:', error);
    }
  };

  const fetchFilteredData = async () => {
    try {
      if (userData && userData.desiredPets && Array.isArray(userData.desiredPets)) {
        const normalizedDesiredPets = userData.desiredPets;
        const property = userData.property; 
  
        const dataCollectionRef = collection(db, 'petListing');
  
        // Initial query to filter by both species and property
        let q = query(
          dataCollectionRef,
          where('species', 'in', normalizedDesiredPets),
          where('property', '==', property) 
        );
  
        let querySnapshot = await getDocs(q);
        let data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
        // If the initial query returns no results, filter by species only
        if (data.length === 0) {
          q = query(
            dataCollectionRef,
            where('species', 'in', normalizedDesiredPets)
          );
  
          querySnapshot = await getDocs(q);
          data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
  
        setFilteredData(data);
      }
    } catch (error) {
      console.error('Error fetching filtered data:', error);
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

  const searchPets = async (searchTerm) => {
    try {
      const dataCollectionRef = collection(db, 'petListing');
      const q = query(dataCollectionRef, where('species', '>=', searchTerm), where('species', '<=', searchTerm + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.id);  // Only get the IDs
      console.log("Fetched IDs:", data);  // Log fetched IDs to confirm it's correct
      router.push({ pathname: 'searchResults', params: { post: data }});  // Route the IDs
    } catch (error) {
      console.error('Error searching pets:', error);
    }
  };  

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    await fetchFilteredData(); 
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBookmarkedPets(); 
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      fetchFilteredData();
    }
  }, [userData]);

  return (
    <SafeAreaView className="bg-bgc h-full">
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="w-full h-full justify-start px-4 py-10">
          <View className="justify-start flex-center items-center justify-center">
            <Text className="text-turqoise font-gb mt-4 text-5xl mb-2 ">
              Search
            </Text>
          </View>

          <SearchBar onSearch={searchPets}/>

          <View className="border-turqoise border-b mt-4 mb-4"></View>

          <Text className="text-xl font-plight text-turqoise">Suggested pets for you:</Text>

          {filteredData.reverse().map((fd) => (
            <View key={fd.id} className="bg-white mt-4">
              <View className="justify-start items-start mt-2">
                <View className="flex-row justify-center items-center ml-2">
                  <Image
                    source={{ uri: fd.profilePicture }}
                    style={{
                      width: 40,
                      height: 40,
                      resizeMode: 'contain',
                      borderRadius: 20,
                    }}
                  />
                  <Text className="text-turqoise font-pbold text-lg ml-2">
                    {fd.username}
                  </Text>
                </View>

                <View className="mt-2 mb-2">
                  <Image
                    source={{ uri: fd.imageUrl }}
                    style={{
                      width: 358,
                      height: 400,
                    }}
                  />
                </View>

                <View className='flex flex-row ml-2 mb-2'>
                  <LikeButton postId={fd.id} collectionName={"petListing"} initialLikes={(fd.likedBy && fd.likedBy.length) || 0} />
                  <TouchableOpacity onPress={() => toggleBookmark(fd.id)} style={{ marginLeft: 10 }}>
                    <Image 
                      source={icons.bookmark} 
                      style={{ 
                        width: 20, 
                        height: 20, 
                        tintColor: bookmarkedPets.includes(fd.id) ? '#416F82' : 'gray' 
                      }} 
                    />
                  </TouchableOpacity>
                </View>

                <View className="flex flex-row ml-2 items-center mb-2">
                  <Text className="text-turqoise font-pbold text-lg">
                    {fd.username}
                  </Text>
                  <Text className="text-darkBrown font-pregular text-lg ml-3">
                    {fd.caption}
                  </Text>
                </View>

                <View>
                  <Text className="text-darkBrown font-pregular text-lg ml-2">
                      status: {fd.status}
                  </Text>
                </View>

                <View className="w-full justify-start px-4 mb-4">
                  <EmailButton
                    title={showDetails ? 'Hide Details' : 'Show Details'}
                    handlePress={() => setShowDetails(!showDetails)}
                    containerStyles="mt-7 bg-turqoise"
                  />
                </View>
                
                {showDetails && (
                  <View className="ml-2 mb-2">
                    <Text className="text-darkBrown font-pregular text-lg">
                      Name: {fd.name}
                    </Text>
                    <Text className="text-darkBrown font-pregular text-lg">
                      Age: {fd.age}
                    </Text>
                    <Text className="text-darkBrown font-pregular text-lg">
                      Species: {fd.species}
                    </Text>
                    <Text className="text-darkBrown font-pregular text-lg">
                      Sex: {fd.sex}
                    </Text>
                    <Text className="text-darkBrown font-pregular text-lg">
                      Breed: {fd.breed}
                    </Text>
                    <Text className="text-darkBrown font-pregular text-lg">
                      Property Type: {fd.property}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}

        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default Search
