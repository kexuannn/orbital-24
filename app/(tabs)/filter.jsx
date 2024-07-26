import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore'; 
import { db } from '../../firebase.config';

import CustomTag from '../../components/CustomTag';
import CustomPicker from '../../components/CustomPicker';
import EmailButton from '../../components/EmailButton';

const FilterPage = () => {
  const router = useRouter();
  
  const [selectedSpecies, setSelectedSpecies] = useState([]);
  const [propertyType, setPropertyType] = useState('');
  const [ageRange, setAgeRange] = useState([0, 20]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const speciesOptions = [
    { id: 'Dog', label: 'Dog' },
    { id: 'Cat', label: 'Cat' },
    { id: 'Rabbit', label: 'Rabbit' },
    { id: 'Others', label: 'Others' },
  ];
  
  const propertyOptions = [
    { label: 'HDB', value: 'HDB' },
    { label: 'Condominium', value: 'Condominium' },
    { label: 'Landed', value: 'Landed' },
  ];

  const toggleSpecies = (species) => {
    setSelectedSpecies((prevState) =>
      prevState.includes(species)
        ? prevState.filter((item) => item !== species)
        : [...prevState, species]
    );
  };

  const applyFilters = async () => {
    try {
      setIsSubmitting(true); // Set isSubmitting to true when starting the process
      const dataCollectionRef = collection(db, 'petListing');
      let q = query(dataCollectionRef);
      
      if (selectedSpecies.length > 0) {
        q = query(q, where('species', 'in', selectedSpecies));
      }
  
      if (propertyType) {
        q = query(q, where('property', '==', propertyType));
      }
  
      if (ageRange[0] !== 0 || ageRange[1] !== 20) {
        q = query(q, where('age', '>=', ageRange[0]), where('age', '<=', ageRange[1]));
      }
  
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        console.log('No matching documents found.');
        // Handle case where no documents match the filters
        setIsSubmitting(false); // Set isSubmitting to false when no documents are found
        router.push({ pathname: 'FilterResults', params: { post: []} });
        return;
      }
  
      const data = querySnapshot.docs.map(doc => doc.id);
      console.log('Matching document IDs:', data); // Log matching document IDs
  
      router.push({ pathname: 'FilterResults', params: { post: data } });
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setIsSubmitting(false); // Set isSubmitting to false when process is completed
    }
  };
  

  return (
    <SafeAreaView className="bg-bgc h-full">
      <ScrollView>
        <View className="w-full h-full justify-start px-4 py-10">
          <View className='justify-center flex-center items-center'>
            <Text className="text-turqoise font-gb mt-4 text-5xl mb-4">
              Select Filters
            </Text>
          </View>

          <Text className="text-base mb-2 font-pmedium text-darkBrown">Species</Text>
          <View className="flex-row flex-wrap mb-4">
            {speciesOptions.map((species) => (
              <CustomTag
                key={species.id}
                label={species.label}
                selected={selectedSpecies.includes(species.id)}
                onPress={() => toggleSpecies(species.id)}
                containerStyles="mr-4 mb-2"
              />
            ))}
          </View>

          <View className='border-b mb-4'></View>

          <Text className="text-base text-darkBrown mb-2 font-pmedium">Property Type</Text>
          <CustomPicker
            selectedValue={propertyType}
            onValueChange={(itemValue) => setPropertyType(itemValue)}
            items={propertyOptions}
          />
          <View className="mb-2">
            <Text className="text-darkBrown font-pmedium text-md">Selected Property Type: {propertyType}</Text>
          </View>

          <View className='border-b mb-4'></View>

          <Text className="text-base text-darkBrown mb-2 font-pmedium">Age Range (in years)</Text>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-md">{ageRange[0]}</Text>
            <Slider
              style={{ width: '45%', height: 40 }}
              minimumValue={0}
              maximumValue={20}
              minimumTrackTintColor="#8E8E93"
              maximumTrackTintColor="#007AFF"
              step={1}
              value={ageRange[0]}
              onValueChange={(value) => setAgeRange([value, ageRange[1]])}
            />
            <Slider
              style={{ width: '45%', height: 40 }}
              minimumValue={0}
              maximumValue={20}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#8E8E93"
              step={1}
              value={ageRange[1]}
              onValueChange={(value) => setAgeRange([ageRange[0], value])}
            />
            <Text className="text-md">{ageRange[1]}</Text>
          </View>

          <View className='border-b mb-4'></View>

          <EmailButton
            title="Apply Filters"
            handlePress={applyFilters}
            isLoading={isSubmitting}
            containerStyles="mt-4 bg-turqoise"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FilterPage;
