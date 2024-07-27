import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { onSnapshot, doc, collection, deleteDoc } from "firebase/firestore";
import { db, auth } from '../../firebase.config';
import HorizontalBar from '../../components/CustomHorizontalBar';
import LikeButton from '../../components/CustomLikeButton';
import DeleteButton from '../../components/CustomDeletePostButton'; // Import the DeleteButton component

const { width: screenWidth } = Dimensions.get('window');

const Fundraising = () => {
  const [fundraising, setFundraising] = useState([]);
  const [shelterData, setShelterData] = useState(null);

  useEffect(() => {
    const fetchFundraising = async () => {
      const postsCollection = collection(db, 'fundraising');

      const unsubscribe = onSnapshot(postsCollection, (snapshot) => {
        const fundraisingData = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data()
        })).filter((fundr) => fundr.data.userId === auth.currentUser.uid);

        // Sort by createdAt in descending order
        const sortedData = fundraisingData.sort((a, b) => 
          b.data.createdAt.toDate().getTime() - a.data.createdAt.toDate().getTime()
        );

        setFundraising(sortedData);
      });

      return () => unsubscribe(); 
    };

    fetchFundraising();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const shelterDocRef = doc(db, 'shelters', user.uid);

      const unsubscribe = onSnapshot(shelterDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setShelterData(docSnap.data());
        } else {
          console.log("No such document!");
        }
      });

      return () => unsubscribe(); 
    }
  }, []);

  useEffect(() => {
    if (shelterData) {
      const updateFundraisingData = fundraising.map((fundr) => {
        if (fundr.data.userId === shelterData.userId) {
          return {
            ...fundr,
            data: {
              ...fundr.data,
              username: shelterData.username,
              profilePicture: shelterData.profilePicture,
            }
          };
        }
        return fundr;
      });
      setFundraising(updateFundraisingData);
    }
  }, [shelterData]); 

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

  const deleteFundraising = async (fundrId) => {
    try {
      await deleteDoc(doc(db, 'fundraising', fundrId));
      setFundraising((prevFundraising) => 
        prevFundraising.filter((fundr) => fundr.id !== fundrId)
      );
    } catch (error) {
      console.error('Error deleting fundraising post:', error);
      Alert.alert('Error deleting post. Please try again.');
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
      <ScrollView>
        <View className="w-full h-full justify-start px-4 py-10">
          <View className='justify-start flex-center items-center'>
            <Text className="text-turqoise font-gb mt-4 text-5xl mb-4">
              {shelterData?.username}
            </Text>
          </View>
          <HorizontalBar data={navigationData} />
          {fundraising.map((fundr) => (
            <View key={fundr.id} className="bg-white mt-4">
              <View className='justify-start items-start mt-2'>
                <View className='flex-row justify-between items-center ml-2'>
                  <View className='flex-row items-center'>
                    <Image
                      source={{ uri: fundr.data.profilePicture }}
                      style={{ width: 40, height: 40, resizeMode: 'contain', borderRadius: 20 }}
                    />
                    <Text className='text-turqoise font-pbold text-lg ml-2'>
                      {fundr.data.username}
                    </Text>
                  </View>
                  
                  <DeleteButton
                    collectionName="fundraising" // Set collection name for delete
                    docId={fundr.id} // Pass the document ID
                    containerStyles="bg-red ml-2 w-20" 
                    textStyles="text-white font-pbold"
                    isLoading={false} 
                    handlePress={() => deleteFundraising(fundr.id)} // Add handlePress for delete
                  />
                </View>

                <View className='mb-2'>
                  <Image
                    source={{ uri: fundr.data.imageUrl }}
                    style={{
                      width: screenWidth - 32, // Width of the screen minus padding
                      height: (screenWidth - 32), // Maintain aspect ratio
                      resizeMode: 'cover',
                      marginVertical: 10,
                    }}
                  />
                </View>
                <View className='ml-2 mb-2'>
                  <LikeButton postId={fundr.id} collectionName={"fundraising"} initialLikes={(fundr.data.likedBy && fundr.data.likedBy.length) || 0} />
                </View>
                <View className='ml-2 mb-2'>
                  <Text className='text-turqoise font-pbold text-lg'>
                    {fundr.data.username}
                  </Text>
                  <Text style={{ color: '#5C4033', fontFamily: 'pregular', fontSize: 16, flexWrap: 'wrap', maxWidth: screenWidth - 32, marginTop: 4 }}>
                    {fundr.data.caption}
                  </Text>
                </View>
                <Text className="text-darkBrown font-pregular text-xs ml-2 mb-2">
                    Posted on: {formatDate(fundr.data.createdAt)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Fundraising;
