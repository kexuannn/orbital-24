import { TouchableOpacity, Text } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

const BackButton = ({ title = "< Back", containerStyles, textStyles, isLoading }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      activeOpacity={0.7}
      className={`bg-transparent rounded-xl min-h-10 justify-center items-center ${containerStyles} ${isLoading ? 'opacity-50' : ''} pb-2`}
      disabled={isLoading}

    >
      <Text className={`text-bgc font-psemibold ${textStyles}`}>{title}</Text>
    </TouchableOpacity>
  );
}

export default BackButton;
