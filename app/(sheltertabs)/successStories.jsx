import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useRouter } from 'expo-router';

import EmailButton from '../../components/EmailButton';
import CustomWebsiteButton from '../../components/CustomWebsiteButton';
import HorizontalBar from '../../components/CustomHorizontalBar';
import LikeButton from '../../components/CustomLikeButton';
import { db, auth } from '../../firebase.config';
import { doc, getDocs, collection, getDoc} from "firebase/firestore";

const Success = () => {

  const [success, setSuccess] = useState([]);


  useEffect(() => {
    const fetchSuccess = async () => {
      try {
        const postsCollection = collection(db, 'success');
        const snapshot = await getDocs(postsCollection);
        const successData = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data()
        })).filter((pet) => pet.data.userId === auth.currentUser.uid);
        setSuccess(successData);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchSuccess();
  }, []);

  const [shelterData, setShelterData] = useState(null);
  
  useEffect(() => {
    const fetchShelterData = async () => {
      try {
        const shelter = auth.currentUser;
        const shelterId = shelter.uid;
        
        const docRef = doc(db, 'shelters', shelterId);

        // Get the document snapshot
        const docSnap = await getDoc(docRef);

        if (docSnap.exists) {
          const data = docSnap.data();
          setShelterData(data); // Set all shelter data to state
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching shelter data:", error);
      }
    };

    fetchShelterData(); 
  }, []);

  
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
    
          {success.reverse().map((succ) => (
            <View key={succ.id} className="bg-white mt-4">
              
              <View className='justify-start items-start mt-2'>

                <View className= 'flex-row justify-center items-center ml-2 '>
                  <Image
                    source={{ uri: succ.data.profilePicture }}
                    style={{ width: 40, height: 40, resizeMode: 'contain', borderRadius:20 }}
                  />

               
                  <Text className='text-turqoise font-pbold text-lg ml-2 '>
                    {succ.data.username}
                  </Text>
              
                </View>

                <View className='mt-2 mb-2'>
                  <Image
                    source={{ uri: succ.data.imageUrl }}
                    style={{ width: 358, height: 400 }}
                  />
                </View>

                <View className='ml-2 mb-2'>
                  <LikeButton postId={succ.id} collectionName={"success"} initialLikes={(succ.data.likedBy && succ.data.likedBy.length) || 0} />
                </View>
                
                <View className='flex justify-start flex-row ml-1 items-center mb-2'>
                <Text className='text-turqoise font-pbold text-lg'>
                  {succ.data.username}
                </Text>
                <Text className='text-darkBrown font-pregular text-reg ml-3 mt-1'>
                  {succ.data.caption}
                </Text>
                </View>
                
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Success