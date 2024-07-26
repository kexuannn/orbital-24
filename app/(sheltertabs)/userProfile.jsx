import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { db } from '../../firebase.config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import FixedTag from '../../components/FixedTag';

const UserProfile = () => {
  const route = useRoute();
  const { userId } = route.params;
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          fetchUserPosts(userId);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserPosts = async (userId) => {
      try {
        const postsQuery = query(collection(db, 'posts'), where('userId', '==', userId));
        const snapshot = await getDocs(postsQuery);
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserPosts(postsData);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <SafeAreaView className="bg-bgc h-full justify-center items-center">
        <ActivityIndicator size="large" color="#00ff00" />
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView className="bg-bgc h-full justify-center items-center">
        <Text>User not found</Text>
      </SafeAreaView>
    );
  }

  // Combine profile info and posts into a single data source for FlatList
  const renderItem = ({ item }) => {
    if (item.type === 'profile') {
      return (
        <View className="mt-10">
          <View className="justify-center items-center">
            <Image
              source={{ uri: userData.profilePicture }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
            <Text className="text-turqoise font-gb text-6xl mt-4">
              {userData.username}
            </Text>
          </View>

          <View className="justify-start ml-6">
            <Text className="text-turqoise font-pregular text-xl mt-2 underline mb-3">
              Desired pets:
            </Text>
            <View className="flex-row flex-wrap mt-1 mb-4">
              {userData.desiredPets && Array.isArray(userData.desiredPets)
                ? userData.desiredPets.map((pet, index) => (
                    <FixedTag
                      key={index}
                      text={pet}
                    />
                  ))
                : <Text className="text-darkBrown font-plight text-lg mt-2">No desired pets listed</Text>
              }
            </View>

            <Text className="text-turqoise font-pregular text-xl mt-2 underline mb-3">
              Current pets:
            </Text>
            <View className="flex-row flex-wrap mt-1 mb-4">
              {userData.current && Array.isArray(userData.current)
                ? userData.current.map((pet, index) => (
                    <FixedTag
                      key={index}
                      text={pet}
                    />
                  ))
                : <Text className="text-darkBrown font-plight text-lg mt-2">No current pets listed</Text>
              }
            </View>
          </View>
        </View>
      );
    }

    if (item.type === 'post') {
      return (
        <View key={item.id} className="bg-white mt-2 p-4 rounded-lg shadow-md ml-4 mr-4">
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: '100%', height: 400, borderRadius: 10 }}
          />
          <Text className="text-darkBrown font-plight text-lg mt-2">
            {item.caption}
          </Text>
        </View>
      );
    }

    return null;
  };

  // Combine profile info and posts into a single array
  const data = [
    { type: 'profile' },
    ...userPosts.map(post => ({ ...post, type: 'post' }))
  ];

  return (
    <SafeAreaView className="bg-bgc h-full">
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id || 'profile'}
      />
    </SafeAreaView>
  );
};

export default UserProfile;
