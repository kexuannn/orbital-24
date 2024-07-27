import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, router} from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import FormField from '../../components/FormField';
import CustomPicker from '../../components/CustomPicker';
import CustomTag from '../../components/CustomTag';
import EmailButton from '../../components/EmailButton';
import ImageViewer from '../../components/ImageViewer';
import { db, auth, storage } from '../../firebase.config';
import { icons } from '../../constants';
import { doc, setDoc, getDoc, deleteDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const User = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profile, setProfile] = useState({
    profilePicture: null,
    username: '',
    email: '',
    contact: '',
    property: '',
    desiredPets: [],
    current: [],
  });

  const desiredPetOptions = [
    { id: 'Dog', label: 'Dog' },
    { id: 'Cat', label: 'Cat' },
    { id: 'Rabbit', label: 'Rabbit' },
    { id: 'Others', label: 'Others' },
  ];

  const currentPetOptions = [
    { id: 'Dog', label: 'Dog' },
    { id: 'Cat', label: 'Cat' },
    { id: 'Rabbit', label: 'Rabbit' },
    { id: 'Others', label: 'Others' },
    { id: 'None', label: 'None' },
  ];

  const [selectedImage, setSelectedImage] = useState(null);

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

  const handlePropertyChange = (value) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      property: value,
    }));
  };

  const handleDesiredTagPress = (tag) => {
    setProfile((prevProfile) => {
      const isSelected = prevProfile.desiredPets.includes(tag);
      const newDesiredPets = isSelected
        ? prevProfile.desiredPets.filter((item) => item !== tag)
        : [...prevProfile.desiredPets, tag];

      return { ...prevProfile, desiredPets: newDesiredPets };
    });
  };

  const handleCurrentTagPress = (tag) => {
    setProfile((prevProfile) => {
      const isSelected = prevProfile.current.includes(tag);
      const newCurrent = isSelected
        ? prevProfile.current.filter((item) => item !== tag)
        : [...prevProfile.current, tag];

      return { ...prevProfile, current: newCurrent };
    });
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(collection(db, "users"), user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile({
            profilePicture: userData.profilePicture,
            username: userData.username || '',
            email: userData.email || '',
            contact: userData.contact || '',
            property: userData.property || '',
            desiredPets: userData.desiredPets || [],
            current: userData.current || [],
          });
          setSelectedImage(userData.profilePicture || icons.profile);
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

        const userDocRef = doc(collection(db, "users"), user.uid);
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
  const deleteProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Delete profile picture from storage if it exists
        if (profile.profilePicture) {
          const fileRef = ref(storage, profile.profilePicture);
          await deleteObject(fileRef);
        }
  
        // Delete user data from Firestore
        const userDocRef = doc(collection(db, "users"), user.uid);
        await deleteDoc(userDocRef);
  
        // Delete user authentication entry
        await user.delete();
  
        console.log('Profile deleted successfully');
        Alert.alert('Profile deleted successfully!');
  
        // Redirect user to a different screen or log them out
        router.push('/sign-up'); // Adjust the route as needed
      } else {
        console.error('User not authenticated');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  const confirmDeleteProfile = () => {
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete your profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteProfile },
      ]
    );
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
              User Profile
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
              handleChangeText={(e) => setProfile({ ...profile, username: e })}
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
              value={profile.contact}
              handleChangeText={(e) => setProfile({ ...profile, contact: e })}
              keyboardType='phone-pad'
              otherStyles="mt-4 mb-4"
            />
          </View>

          <View className='border-b border-turqoise'>
            <Text className="text-darkBrown font-pmedium mt-4 text-base">Property Type:</Text>
            <CustomPicker
              selectedValue={profile.property}
              onValueChange={handlePropertyChange}
              items={[
                { label: 'HDB', value: 'HDB' },
                { label: 'Condominium', value: 'Condominium' },
                { label: 'Landed', value: 'Landed' },
              ]}
            />
            <View className="mb-2">
              <Text className="text-darkBrown font-pmedium text-md">Selected Property Type: {profile.property}</Text>
            </View>
          </View>

          <View className='border-b border-turqoise'>
            <Text className="text-darkBrown font-pmedium mt-4 text-base">Desired Pet Type(s):</Text>
            <View className="flex-row flex-wrap">
              {desiredPetOptions.map((option) => (
                <CustomTag
                  containerStyles="m-2 mb-4"
                  key={option.id}
                  label={option.label}
                  selected={profile.desiredPets.includes(option.id)}
                  onPress={() => handleDesiredTagPress(option.id)}
                />
              ))}
            </View>
          </View>

          <Text className="text-darkBrown font-pmedium mt-4 text-base">Current Pet(s):</Text>
          <View className="flex-row flex-wrap mt-2">
            {currentPetOptions.map((option) => (
              <CustomTag
                containerStyles="m-1"
                key={option.id}
                label={option.label}
                selected={profile.current.includes(option.id)}
                onPress={() => handleCurrentTagPress(option.id)}
              />
            ))}
          </View>

          <EmailButton
            title="View bookmarked pets"
            handlePress={() => router.push('../bookmarked')}
            containerStyles="mt-10 bg-darkBrown p-3 rounded-xl"
          />

        <TouchableOpacity
          onPress={() => router.push({ pathname: 'viewyourposts', params: { userId: auth.currentUser.uid } })}
          activeOpacity={0.7}
          className={`mt-10 bg-darkBrown rounded-xl min-h-[62px] justify-center items-center  `}
        >
          <Text className={`text-bgc font-psemibold `}>
            View your posts
          </Text>
        </TouchableOpacity>

          <EmailButton
            title="Save Profile"
            handlePress={saveProfile}
            containerStyles="mt-7 bg-turqoise p-3 rounded-xl"
            isLoading={isSubmitting}
          />

          <TouchableOpacity onPress={confirmDeleteProfile} className="mt-7 bg-red p-3 rounded-xl min-h-[62px] justify-center items-center">
            <Text className="font-pbold text-bgc text-center">Delete Profile</Text>
          </TouchableOpacity>


          

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default User;
