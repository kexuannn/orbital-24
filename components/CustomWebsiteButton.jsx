import React from 'react';
import { TouchableOpacity, Text, Linking } from 'react-native';

const WebsiteButton = ({ title, url, containerStyles }) => {
  const handlePress = async () => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening website:', error);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-darkBrown rounded-xl min-h-[62px] justify-center items-center ${containerStyles}`}
    >
      <Text className=" text-center underline text-bgc font-psemibold">{title}</Text>
    </TouchableOpacity>
  );
};

export default WebsiteButton;
