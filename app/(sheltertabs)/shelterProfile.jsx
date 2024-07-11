import { View, Text, ScrollView, Image, Button, Alert, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams} from 'expo-router';
import * as ImagePicker from 'expo-image-picker';


import FormField from '../../components/FormField';
import ImageViewer from '../../components/ImageViewer';
import EmailButton from '../../components/EmailButton';
import { db, auth, storage } from '../../firebase.config';
import { icons } from '../../constants';
import { doc, setDoc, getDoc, collection} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const shelterProfile = () => {
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [profile, setProfile] = useState({
    profilePicture: icons.profile,
    username: '',
    email: '',
    number: '',
    address: '',
    contactemail: '',
    website: '',
  });

  const [selectedImage, setSelectedImage] = useState(null);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    } else {
      alert('You did not select any image.');
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(collection(db, "shelters"), user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile({
            profilePicture: userData.profilePicture || icons.profile,
            username: userData.username || '',
            email: userData.email || '',
            number: userData.number || '',
            contactemail: userData.contactemail || '',
            address: userData.address || '',
            website: userData.website || '',
          });
          setSelectedImage({ localUri: userData.profilePicture || icons.profile });
        }
      }
    };

    fetchUserProfile();
  }, []);
  
  const saveProfile = async () => {
    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (user) {
        let profilePictureUrl = profile.profilePicture;

        if (selectedImage && selectedImage !== profile.profilePicture) {
          try {
            profilePictureUrl = await uploadImageAsync(selectedImage);
          } catch (error) {
            console.error('Error uploading image:', error);
          }
        }

        const updatedProfile = {
          ...profile,
          profilePicture: profilePictureUrl,
          email: user.email,
        };

        const userDocRef = doc(collection(db, "shelters"), user.uid);
        await setDoc(userDocRef, updatedProfile);
        console.log('Profile saved:', updatedProfile);
        Alert.alert('Profile saved successfully!')
      } else {
        console.error('User not authenticated');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImageAsync = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileRef = ref(storage, `profilePictures/${auth.currentUser.uid}/${Date.now()}`);
    await uploadBytes(fileRef, blob);

    // Get the download URL
    const downloadUrl = await getDownloadURL(fileRef);
    return downloadUrl;
  };
  
  return (
    <SafeAreaView className="bg-bgc h-full">
        <ScrollView>
            <View className="w-full h-full justify-start px-4 py-10">
            
            <View className='justify-center flex-center items-center'>
                <Text className="text-turqoise font-gb mt-4 text-5xl mb-4">
                  Shelter Profile
                </Text>
              </View>

            <View className="items-center">
              <ImageViewer
                placeholderImageSource={icons.profile}
                selectedImage={selectedImage}
              />

              <TouchableOpacity onPress={pickImageAsync}>
                <Text className='font-pmedium underline mt-2 text-sm'>edit profile picture</Text>
              </TouchableOpacity>
            </View>

              <View className='border-b border-turqoise'>
                <FormField
                    title="Username:"
                    value={profile.username}
                    handleChangeText={(e) => setProfile({...profile, username: e})}
                    otherStyles="mt-4 mb-4"
                />
              </View>

              <View className='border-b border-turqoise'>
                <Text className="text-darkBrown font-pmedium mt-4 text-base mb-4">
                  Email: {auth.currentUser.email}
                </Text>
              </View>
              
              <View className='border-b border-turqoise'>
                <FormField
                    title="Contact Number:"
                    value={profile.number}
                    handleChangeText={(e) => setProfile({...profile, number: e})}
                    keyboardType='phone-pad'
                    otherStyles="mt-4 mb-4"
                />
              </View>

              <View className='border-b border-turqoise'>
                <FormField
                    title="Website:"
                    value={profile.website}
                    handleChangeText={(e) => setProfile({...profile, website: e})}
                    otherStyles="mt-4 mb-4"
                />
              </View>

              <View className='border-b border-turqoise'>
                <FormField
                    title="Contact Email:"
                    value={profile.contactemail}
                    handleChangeText={(e) => setProfile({...profile, contactemail: e})}
                    keyboardType='email-address'
                    otherStyles="mt-4 mb-4"
                />
              </View>

              <View className='border-b border-turqoise'>
                <FormField
                    title="Address:"
                    value={profile.address}
                    handleChangeText={(e) => setProfile({...profile, address: e})}
                    otherStyles="mt-4 mb-4"
                />
              </View>

                <EmailButton
                    title="Save Profile"
                    handlePress={saveProfile}
                    containerStyles="mt-7 bg-turqoise p-3 rounded-xl"
                    isLoading={isSubmitting}
                />

            </View>
        </ScrollView>
    </SafeAreaView>
  )
}

export default shelterProfile