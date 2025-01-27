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
  });

  const [petDetails, setPetDetails] = useState({
    age: '',
    name: '',
    species: '',
    sex:'',
    breed: '',
    property: '',
    status: 'available',
    searchable: '',
  });

  const createSearchableString = (details) => {
    const { age, name, species, sex, breed, property, status } = details;
    return `${age} ${name} ${species} ${sex} ${breed} ${property} ${status}`.toLowerCase();
  };
  
  const tokenizeString = (text) => {
    return text.toLowerCase().split(/\s+/).filter(Boolean); 
  };
  

  const handlePropertyChange = (value) => {
    setPetDetails((prevPetDetails) => {
      const updatedDetails = { ...prevPetDetails, property: value };
      return { ...updatedDetails, searchable: createSearchableString(updatedDetails) };
    });
  };

  const handleSpeciesChange = (value) => {
    setPetDetails((prevPetDetails) => {
      const updatedDetails = { ...prevPetDetails, species: value };
      return { ...updatedDetails, searchable: createSearchableString(updatedDetails) };
    });
  };

  const handlePetDetailsChange = (field, value) => {
    setPetDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails, [field]: value };
      return { ...updatedDetails, searchable: createSearchableString(updatedDetails) };
    });
  };

  const toggleStatus = () => {
    setPetDetails((prevDetails) => {
      const statuses = ['available', 'pending adoption', 'adopted'];
      const currentIndex = statuses.indexOf(prevDetails.status);
      const nextIndex = (currentIndex + 1) % statuses.length;
      const updatedDetails = {
        ...prevDetails,
        status: statuses[nextIndex],
      };
      return {
        ...updatedDetails,
        searchable: createSearchableString(updatedDetails),
      };
    });
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
      if (!user) {
        Alert.alert('Error: User is not authenticated.');
        setIsSubmitting(false);
        return;
      }
  
      // Fetch user data from Firestore
      const userDocRef = doc(db, "shelters", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);
  
      if (!userDocSnapshot.exists()) {
        Alert.alert('Error: User information not found.');
        setIsSubmitting(false);
        return;
      }
  
      const userData = userDocSnapshot.data();
      const username = userData.username || '';
      const profilePicture = userData.profilePicture || '';
  
      // Check if both fields are present
      if (!username || !profilePicture) {
        Alert.alert('You must fill in username and profile picture before posting.');
        setIsSubmitting(false);
        return;
      }
  
      if (selectedImage) {
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
          setIsSubmitting(false);
          return;
        }
  
        const searchableString = createSearchableString(petDetails);
        const searchableTokens = tokenizeString(searchableString);
  
        await setDoc(postDocRef, {
          userId: user.uid,
          username,
          postType: post.postType,
          profilePicture,
          imageUrl,
          caption,
          createdAt: new Date(),
          comments: [],
          ...petDetails,
          searchable: searchableString,
          searchableTokens: searchableTokens // Store tokens
        });
  
        Alert.alert('Post created successfully!');
        setSelectedImage(null);
        setCaption('');
        setPetDetails({
          name: '',
          age: '',
          sex: '',
          species: '',
          breed: '',
          property: '',
          status: 'available',
          searchable: '',
          searchableTokens: []
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
  
  
  const handlePostChange = (value) => {
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
                placeholder="Age (in years):"
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

            <Text className="text-turqoise font-pregular mt-4 text-base mx-2">Species:</Text>
            <CustomPicker
              selectedValue={petDetails.species}
              onValueChange={handleSpeciesChange}
              items={[
                { label: 'Dog', value: 'Dog' },
                { label: 'Cat', value: 'Cat' },
                { label: 'Rabbit', value: 'Rabbit' },
                { label: 'Others', value: 'Others' }
              ]}
            />
            <View className="mb-2">
              <Text className="text-turqoise font-pregular text-md mx-2">Selected Species: {petDetails.species}</Text>
            </View>

            <View className='border-b border-turqoise'></View>

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

            <Text className="text-turqoise font-pregular mt-4 text-base mx-2">Property Type:</Text>
            <CustomPicker
              selectedValue={petDetails.property}
              onValueChange={handlePropertyChange}
              items={[
                { label: 'HDB', value: 'HDB' },
                { label: 'Condominium', value: 'Condominium' },
                { label: 'Landed', value: 'Landed' },
              ]}
            />
            <View className="mb-2">
              <Text className="text-turqoise font-pregular text-md mx-2">Selected Property Type: {petDetails.property}</Text>
            </View>

            <View className='border-b border-turqoise mb-5'></View>

              
              <View className="flex items-center my-2.5">
                <TouchableOpacity onPress={toggleStatus} className="bg-[#416F82] p-2.5 rounded">
                  <Text className="text-white font-poppins-regular">Status (Current: {petDetails.status})</Text>
                 </TouchableOpacity>
              </View>


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
