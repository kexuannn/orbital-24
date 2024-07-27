import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, FlatList, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { db } from '../../firebase.config';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { Rating } from 'react-native-ratings';
import EmailButton from '../../components/EmailButton';

const ShelterProfile = () => {
  const route = useRoute();
  const { userId } = route.params;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'shelters', userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          if (data.ratings && data.ratings.count > 0) {
            setAverageRating(data.ratings.sum / data.ratings.count);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleRating = async () => {
    if (userData) {
      setIsSubmitting(true);
      try {
        const userDocRef = doc(db, 'shelters', userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.error('Shelter does not exist');
          return;
        }

        const data = userDoc.data();
        const newRatings = data.ratings || { sum: 0, count: 0 };

        await updateDoc(userDocRef, {
          'ratings.sum': increment(userRating),
          'ratings.count': increment(1),
        });

        const newSum = newRatings.sum + userRating;
        const newCount = newRatings.count + 1;
        const newAverageRating = newSum / newCount;
        setAverageRating(newAverageRating);
        Alert.alert('Rating submitted successfully!');
      } catch (error) {
        console.error('Error updating rating:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-bgc h-full justify-center items-center">
        <ActivityIndicator size="large" color="grey" />
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView className="bg-gray-200 h-full justify-center items-center">
        <Text>User not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-bgc h-full">
      <FlatList
        data={[{ type: 'profile' }]}
        renderItem={() => (
          <View className="flex-1 justify-center items-center px-4 ">
            <View className="flex-col items-center mb-6">
              <Image
                source={{ uri: userData.profilePicture }}
                className="w-24 h-24 rounded-full mt-7"
              />
              <Text className="text-turqoise font-gb text-6xl mt-4">
                {userData.username}
              </Text>
            </View>

            <View className="w-full max-w-lg mt-4 px-4">
              <Text className="text-brown-600 text-lg mb-2">
                <Text className="font-bold">Address: </Text>{userData.address}
              </Text>
              <Text className="text-brown-600 text-lg mb-2">
                <Text className="font-bold">Email: </Text>{userData.contactemail}
              </Text>
              <Text className="text-brown-600 text-lg mb-2">
                <Text className="font-bold">Number: </Text>{userData.number}
              </Text>
              <Text className="text-brown-600 text-lg mb-2" onPress={() => Linking.openURL(`https://${userData.website}`)}>
                <Text className="font-bold">Website: </Text>{userData.website}
              </Text>

              <Text className="text-brown-600 text-lg mb-2">
                <Text className="font-bold">Description of shelter: </Text>
                {userData.description || 'No description available'}
              </Text>

              <View className="bg-white p-4 rounded-lg mt-4 items-center">
                <Text className="text-brown-600 text-lg mb-2">
                  <Text className="font-bold">Average Rating: </Text>{averageRating.toFixed(1)} / 5
                </Text>

                <Text className="text-brown-600 text-lg mb-4">
                  Leave a rating below!
                </Text>
                <Rating 
                  startingValue={userRating}
                  imageSize={60}
                  onFinishRating={setUserRating}
                  style={{ paddingVertical: 10 }}
                  type="custom"
                  ratingBackgroundColor='transparent'
                />

                <EmailButton
                  title={isSubmitting ? <ActivityIndicator size="small" color="white" /> : 'Rate!'}
                  handlePress={handleRating}
                  containerStyles="bg-turqoise p-3 rounded mt-4 w-full"
                  disabled={isSubmitting} 
                /> 
              </View>
            </View>
          </View>
        )}
        keyExtractor={item => item.type}
      />
    </SafeAreaView>
  );
};

export default ShelterProfile;
