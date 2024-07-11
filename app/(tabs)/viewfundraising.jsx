import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../constants';
import HorizontalBar from '../../components/CustomHorizontalBar';
import { db, auth } from '../../firebase.config';
import { doc, getDocs, collection, getDoc } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';
import LikeButton from '../../components/CustomLikeButton';
import BackButton from '../../components/CustomBackButton';

const viewFundraising = () => {
  const route = useRoute();
  const { optionalParameter } = route.params;

  const [fundraising, setFundraising] = useState([]);
  const [shelterData, setShelterData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFundraising();
    fetchShelterData();
  }, []);

  const fetchFundraising = async () => {
    try {
      const postsCollection = collection(db, 'fundraising');
      const snapshot = await getDocs(postsCollection);
      const fundraisingData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          data: doc.data(),
        })).filter((fundraising) => fundraising.data.userId === optionalParameter);
     
  
      setFundraising(fundraisingData);
    } catch (error) {
      console.error('Error fetching fundraising data:', error);
    }
  };

  const fetchShelterData = async () => {
    try {
      if (!optionalParameter) {
        console.error('ID is undefined or null');
        return;
      }
  
      const docRef = doc(db, 'shelters', optionalParameter);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        setShelterData(data); // Set all shelter data to state
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching shelter data:', error);
    }
  };
  

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFundraising();
    await fetchShelterData();
    setRefreshing(false);
  };

  const navigationData = [
    {
      id: '1',
      title: 'Pet Listing',
      screen: 'viewhome', // Adjust screen names as needed
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
        <View className="w-full h-full justify-start px-4 py-10">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <BackButton 
              containerStyles="p-3 rounded-xl mb-4" 
              textStyles="text-turqoise" 
            />
            <Text className="pl-20 pb-18 text-turqoise font-gb mt-4 text-5xl mb-4">
              {shelterData?.username}
            </Text>
          </View>

          <HorizontalBar data={navigationData} optionalParameter={optionalParameter}/>

          {fundraising.reverse().map((fund) => (
            <View key={fund.id} className="bg-white mt-4">
              <View className="justify-start items-start mt-2">
                <View className="flex-row justify-center items-center ml-2">
                  <Image
                    source={{ uri: fund.data.profilePicture }}
                    style={{
                      width: 40,
                      height: 40,
                      resizeMode: 'contain',
                      borderRadius: 20,
                    }}
                  />
                  <Text className="text-turqoise font-pbold text-lg ml-2">
                    {fund.data.username}
                  </Text>
                </View>

                <View className="mt-2 mb-2">
                  <Image
                    source={{ uri: fund.data.imageUrl }}
                    style={{
                      width: 358,
                      height: 400,
                    }}
                  />
                </View>

                <View className='ml-2 mb-2'>
                  <LikeButton postId={fund.id} collectionName={"fundraising"} initialLikes={(fund.data.likedBy && fund.data.likedBy.length) || 0} />
                </View>

                <View className="flex flex-row ml-2 items-center mb-2">
                  <Text className="text-turqoise font-pbold text-lg">
                    {fund.data.username}
                  </Text>
                  <Text className="text-darkBrown font-pregular text-lg ml-3">
                    {fund.data.caption}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default viewFundraising;
