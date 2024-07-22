import React from 'react';
import { View, Text } from 'react-native';

const FixedTag = ({ text }) => {
  return (
    <View className="bg-darkBrown rounded-xl py-1 px-3 mr-5 mb-2">
      <Text className="text-white text-lg">{text}</Text>
    </View>
  );
};

export default FixedTag;
