import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { db, storage, auth } from '../../firebase.config';
import { doc, setDoc, collection, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import EmailButton from '../../components/EmailButton';
import CustomPicker from '../../components/CustomPicker';

const PostShelterImage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [post, setPost] = useState({
    postType: '',
  })

  const [petDetails, setPetDetails] = useState({
    age: '',
    name: '',
    species: '',
    sex:'',
    breed: '',

  });

  const handlePetDetailsChange = (field, value) => {
    setPetDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
    }));
  };

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

  const handleShelterPost = async () => {
    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (user && selectedImage) {
        const imageUrl = await uploadImageAsync(selectedImage);

        let postDocRef = null;
        if (post.postType === 'Fundraising Events') {
          postDocRef = doc(collection(db, "fundraising"), `${user.uid}_${Date.now()}`);
        } else if (post.postType === 'Success Stories') {
          postDocRef = doc(collection(db, "success"), `${user.uid}_${Date.now()}`);
        } else if (post.postType === 'Pet Listing') {
          postDocRef = doc(collection(db, "petListing"), `${user.uid}_${Date.now()}`); 
        } else {
          Alert.alert('Error posting image. Please try again.');
        }
        
        const userDocRef = doc(collection(db, "shelters"), user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        const username = userDocSnapshot.exists() ? userDocSnapshot.data().username : 'Unknown';
        const profilePicture = userDocSnapshot.exists() ? userDocSnapshot.data().profilePicture : 'Unknown';
        await setDoc(postDocRef, {
          userId: user.uid,
          username,
          postType: post.postType,
          profilePicture,
          imageUrl,
          caption,
          createdAt: new Date(),
          ...petDetails
        });

        Alert.alert('Post created successfully!');
        setSelectedImage(null);
        setCaption('');
        setPetDetails({
          name: '',
          age: '',
          sex:'',
          species: '',
          breed: '',
        });
      } else {
        Alert.alert('You must select an image and add a caption.');
      }
    } catch (error) {
      console.error('Error posting image:', error);
      Alert.alert('Error posting image. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostChange= (value) => {
    setPost((prevPost) => ({
      ...prevPost,
      postType: value,
    }));
  };

  return (
    <SafeAreaView className="bg-bgc h-full">
      <ScrollView>
        <View className="w-full h-full justify-start px-4 py-10">
          <View className='justify-center flex-center items-center'>
            <Text className="text-turqoise font-gb mt-4 text-5xl mb-4">
              Share a post
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

          <View className='border-b border-turqoise mb-4'>
            <Text className="text-darkBrown font-pmedium mt-4 text-base">Post Type:</Text>
            <CustomPicker
              selectedValue={post.postType}
              onValueChange={handlePostChange}
              items={[
                { label: 'Pet Listing', value: 'Pet Listing' },
                { label: 'Fundraising Events', value: 'Fundraising Events' },
                { label: 'Success Stories', value: 'Success Stories' },
              ]}
            />
            
            <View className="mb-2">
              <Text className="text-darkBrown font-pmedium text-md">Selected Post Type: {post.postType}</Text>
            </View>
          </View>

          {post.postType === 'Pet Listing' && (
            <View style={{ marginBottom: 20 }}>
              <TextInput
                placeholder="Name:"
                placeholderTextColor='#416F82'
                value={petDetails.name}
                onChangeText={(text) => handlePetDetailsChange('name', text)}
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

              <TextInput
                placeholder="Age:"
                placeholderTextColor='#416F82'
                value={petDetails.age}
                onChangeText={(text) => handlePetDetailsChange('age', text)}
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

              <TextInput
                placeholder="Sex:"
                placeholderTextColor='#416F82'
                value={petDetails.sex}
                onChangeText={(text) => handlePetDetailsChange('sex', text)}
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

              <TextInput
                placeholder="Species:"
                placeholderTextColor='#416F82'
                value={petDetails.species}
                onChangeText={(text) => handlePetDetailsChange('species', text)}
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

              <TextInput
                placeholder="Breed:"
                placeholderTextColor='#416F82'
                value={petDetails.breed}
                onChangeText={(text) => handlePetDetailsChange('breed', text)}
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

            </View>
          )}

          <EmailButton
            title='Post'
            handlePress={handleShelterPost}
            isLoading={isSubmitting}
            containerStyles={`bg-turqoise`}
          /> 

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PostShelterImage;
