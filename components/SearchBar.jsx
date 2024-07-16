import React, { useState } from 'react';
import { View, TextInput } from 'react-native';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (text) => {
    setQuery(text);
    onSearch(text);
  };

  return (
    <View className = 'p-2 bg-bgc border-darkBrown'>
      <TextInput
        className='h-10 border border-darkBrown px-3 rounded color-darkBrown'
        placeholder="Search for your new pet..."
        placeholderTextColor={'#463939'}
        value={query}
        onChangeText={handleChange}
      />
    </View>
  );
};

export default SearchBar;
