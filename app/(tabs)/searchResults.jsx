import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, query, where, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

import LikeButton from '../../components/CustomLikeButton';
import EmailButton from '../../components/EmailButton';
import { icons } from '../../constants';
import { auth, db } from '../../firebase.config';
import BackButton from '../../components/CustomBackButton';

const SearchResults = () => {
  const route = useRoute();
  const { post = '' } = route.params;
  const postArray = Array.isArray(post) ? post : post.split(',').map(id => id.trim());
  console.log('IDs received from route:', postArray);
  
  const [results, setResults] = useState([]);
  const [bookmarkedPets, setBookmarkedPets] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch results based on IDs
  const fetchResults = async () => {
    try {
      if (!Array.isArray(postArray) || postArray.length === 0) {
        console.log('No valid IDs provided.');
        return;
      }

      console.log('Fetching results for IDs:', postArray);

      const postsCollection = collection(db, 'petListing');
      const q = query(postsCollection, where('__name__', 'in', postArray));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('No matching documents found.');
      } else {
        const resultData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Fetched documents:', resultData);
        setResults(resultData);
      }
    } catch (error) {
      console.error('Error fetching pet listings:', error);
    }
  };

  useEffect(() => {
    console.log('UseEffect triggered. IDs:', postArray);
    fetchResults();
  }, []);

  useEffect(() => {
    fetchBookmarkedPets();
  }, []);

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
        console.log('Updated bookmarkedPets:', updatedBookmarkedPets);
        setBookmarkedPets(updatedBookmarkedPets);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  return (
    <SafeAreaView className="bg-bgc h-full">
      <ScrollView>
        <View className="w-full h-full justify-start px-4 py-10">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <BackButton 
              containerStyles="p-3 rounded-xl mb-4" 
              textStyles="text-turqoise" 
            />
            <Text className="pl-20 pb-18 text-turqoise font-gb mt-4 text-5xl mb-4">
              Results
            </Text>
          </View>

          {results.length > 0 ? (
            results.reverse().map((result) => (
              <View key={result.id} className="bg-white mt-4">
                <View className="justify-start items-start mt-2">
                  <View className="flex-row justify-center items-center ml-2">
                    <Image
                      source={{ uri: result.profilePicture }}
                      style={{
                        width: 40,
                        height: 40,
                        resizeMode: 'contain',
                        borderRadius: 20,
                      }}
                    />
                    <Text className="text-turqoise font-pbold text-lg ml-2">
                      {result.username}
                    </Text>
                  </View>

                  <View className="mt-2 mb-2">
                    <Image
                      source={{ uri: result.imageUrl }}
                      style={{
                        width: 358,
                        height: 400,
                      }}
                    />
                  </View>

                  <View className='flex flex-row ml-2 mb-2'>
                    <LikeButton postId={result.id} collectionName={"petListing"} initialLikes={(result.likedBy && result.likedBy.length) || 0} />
                    <TouchableOpacity onPress={() => toggleBookmark(result.id)} style={{ marginLeft: 10 }}>
                      <Image
                        source={icons.bookmark}
                        style={{
                          width: 20,
                          height: 20,
                          tintColor: bookmarkedPets.includes(result.id) ? '#416F82' : 'gray'
                        }}
                      />
                    </TouchableOpacity>
                  </View>

                  <View className="flex flex-row ml-2 items-center mb-2">
                    <Text className="text-turqoise font-pbold text-lg">
                      {result.username}
                    </Text>
                    <Text className="text-darkBrown font-pregular text-lg ml-3">
                      {result.caption}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-darkBrown font-pregular text-lg ml-2">
                      status: {result.status}
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
                        Name: {result.name}
                      </Text>
                      <Text className="text-darkBrown font-pregular text-lg">
                        Age: {result.age}
                      </Text>
                      <Text className="text-darkBrown font-pregular text-lg">
                        Species: {result.species}
                      </Text>
                      <Text className="text-darkBrown font-pregular text-lg">
                        Sex: {result.sex}
                      </Text>
                      <Text className="text-darkBrown font-pregular text-lg">
                        Breed: {result.breed}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text className="text-darkBrown font-pregular text-lg">No results found.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchResults;
