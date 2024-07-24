import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { onSnapshot, doc, collection } from "firebase/firestore";
import { db, auth } from '../../firebase.config';
import HorizontalBar from '../../components/CustomHorizontalBar';
import LikeButton from '../../components/CustomLikeButton';

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
        })).filter((pet) => pet.data.userId === auth.currentUser.uid);

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
                <View className='flex-row justify-center items-center ml-2 '>
                  <Image
                    source={{ uri: fundr.data.profilePicture }}
                    style={{ width: 40, height: 40, resizeMode: 'contain', borderRadius: 20 }}
                  />
                  <Text className='text-turqoise font-pbold text-lg ml-2 '>
                    {fundr.data.username}
                  </Text>
                </View>
                <View className='mt-2 mb-2'>
                  <Image
                    source={{ uri: fundr.data.imageUrl }}
                    style={{ width: 358, height: 400}}
                  />
                </View>

                <View className='ml-2 mb-2'>
                  <LikeButton postId={fundr.id} collectionName={"fundraising"} initialLikes={(fundr.data.likedBy && fundr.data.likedBy.length) || 0} />
                </View>

                <View className='flex flex-row ml-2 items-center mb-2'>
                  <Text className='text-turqoise font-pbold text-lg'>
                    {fundr.data.username}
                  </Text>
                  <Text className='text-darkBrown font-pregular text-lg ml-3'>
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
