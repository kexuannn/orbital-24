import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Image } from 'react-native';
import { router } from 'expo-router';

import { icons } from '../constants';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <View className="flex-row items-center p-2 bg-bgc border-darkBrown">
      <TextInput
        className="flex-1 h-10 border border-darkBrown px-3 rounded color-darkBrown font-plight"
        placeholder="Search for your new pet..."
        placeholderTextColor="#463939"
        value={query}
        onChangeText={setQuery}
      />
      <TouchableOpacity
        className="ml-2 px-4 py-2.5 bg-turqoise rounded"
        onPress={handleSearch}
      >
        <Text className="text-white font-plight">Go!</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="ml-1"
        onPress={() => router.push('filter')}
      >
        <Image
          source={icons.filter}
          style={{ width: 40, height: 40 }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
