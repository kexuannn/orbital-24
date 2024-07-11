import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const CustomTag = ({ label, selected, onPress, containerStyles }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`rounded-2xl px-4 py-2 ${containerStyles} ${selected ? 'bg-turqoise' : 'bg-gray-300'}`}
        >
            <Text className={`text-sm font-pmedium ${selected ? 'text-white' : 'text-darkBrown'}`}>
                {label}

            </Text>
        </TouchableOpacity>
    )
}

export default CustomTag;