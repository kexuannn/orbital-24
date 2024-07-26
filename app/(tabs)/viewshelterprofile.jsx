import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, FlatList, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { db } from '../../firebase.config';
import { doc, getDoc } from 'firebase/firestore';

const ShelterProfile = () => {
  const route = useRoute();
  const { userId } = route.params;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'shelters', userId));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
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

  return (
    <SafeAreaView className="bg-bgc h-full">
      <FlatList
        data={[{ type: 'profile' }]}
        renderItem={() => (
          <View className="mt-10">
            <View className="justify-center items-center">
              <Image
                source={{ uri: userData.profilePicture }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
              <Text className="text-turquoise font-gb text-6xl mt-4">
                {userData.username}
              </Text>
            </View>

            <View className="justify-start ml-6 mt-4">
              <Text className="text-darkBrown font-pregular text-lg">
                <Text className="font-bold">Address: </Text>{userData.address}
              </Text>
              <Text className="text-darkBrown font-pregular text-lg mt-2">
                <Text className="font-bold">Email: </Text>{userData.contactemail}
              </Text>
              <Text className="text-darkBrown font-pregular text-lg mt-2">
                <Text className="font-bold">Number: </Text>{userData.number}
              </Text>
              <Text className="text-darkBrown font-pregular text-lg mt-2" onPress={() => Linking.openURL(`https://${userData.website}`)}>
                <Text className="font-bold">Website: </Text>{userData.website}
              </Text>
            </View>
          </View>
        )}
        keyExtractor={item => item.type}
      />
    </SafeAreaView>
  );
};

export default ShelterProfile;
