import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { db, storage, auth } from '../../firebase.config';
import { doc, setDoc, collection, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import EmailButton from '../../components/EmailButton';

const PostImage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    } else {
      Alert.alert('You did not select any image.');
    }
  };

  const uploadImageAsync = async (uri) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User is not authenticated");
    }

    const response = await fetch(uri);
    const blob = await response.blob();
    const fileRef = ref(storage, `posts/${user.uid}/${Date.now()}`);
    await uploadBytes(fileRef, blob);

    const downloadUrl = await getDownloadURL(fileRef);
    return downloadUrl;
  };

  const handlePost = async () => {
    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        // Handle the case where there is no authenticated user
        Alert.alert('Error: User is not authenticated.');
        return;
      }
  
      if (!selectedImage) {
        // Handle the case where no image is selected
        Alert.alert('You must select an image before posting.');
        return;
      }
  
      // Fetch user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);
  
      if (!userDocSnapshot.exists()) {
        // Handle the case where user document does not exist
        Alert.alert('Error: User information not found.');
        return;
      }
  
      const userData = userDocSnapshot.data();
      const username = userData.username || null;
      const profilePicture = userData.profilePicture || null;
  
      if (!username || !profilePicture) {
        // Handle the case where username or profile picture is missing
        Alert.alert('You must fill in username and profile picture before posting.');
        return;
      }
  
      // Upload the image and get the URL
      const imageUrl = await uploadImageAsync(selectedImage);
  
      // Define the post document reference
      const postDocRef = doc(collection(db, "posts"), `${user.uid}_${Date.now()}`);
  
      // Create the post document
      await setDoc(postDocRef, {
        userId: user.uid,
        username,
        profilePicture,
        imageUrl,
        caption,
        createdAt: new Date(),
      });
  
      // Notify the user of success
      Alert.alert('Post created successfully!');
      
      // Reset the form
      setSelectedImage(null);
      setCaption('');
    } catch (error) {
      // Handle any errors that occur during the process
      console.error('Error posting image:', error);
      Alert.alert('Error posting image. Please try again.');
    } finally {
      // Ensure that submission state is reset
      setIsSubmitting(false);
    }
  };
  

  return (
    <SafeAreaView className="bg-bgc h-full">
      <ScrollView>
        <View className="w-full h-full justify-start px-4 py-10">
          <View className='justify-center flex-center items-center'>
            <Text className="text-turqoise font-gb mt-4 text-5xl mb-4">
              Share your Experience
            </Text>
          </View>

          <View className="items-center">
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={{ width: 300, height: 300 } } />
            ) : (
              <Text>No image selected</Text>
            )}

            <TouchableOpacity onPress={pickImageAsync}>
              <Text className='font-pmedium underline mt-2 text-sm'>Pick an image</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Add a caption..."
            placeholderTextColor='#416F82'
            value={caption}
            onChangeText={setCaption}
            style={{
              borderBottomWidth: 1,
              borderColor: '#416F82',
              marginVertical: 10,
              padding: 8,
              fontSize: 16,
              color: '#416F82',
              fontFamily: 'Poppins-regular'
            }}
          />

          <EmailButton
            title='Post'
            handlePress={handlePost}
            isLoading={isSubmitting}
          /> 

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PostImage;
