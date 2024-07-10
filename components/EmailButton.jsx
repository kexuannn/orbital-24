import { TouchableOpacity, Text } from 'react-native'
import React from 'react'

const EmailButton = ({title, handlePress, containerStyles, textStyles, isLoading}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-darkBrown rounded-xl min-h-[62px] justify-center items-center ${containerStyles} ${isLoading ? 'opacity-50' : ''}`}
      disabled={isLoading}
    >
      <Text className={`text-bgc font-psemibold ${textStyles}`}>{title}</Text>
    </TouchableOpacity>
  )
}

export default EmailButton