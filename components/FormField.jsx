import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

import { icons } from '../constants'

const FormField = ({title, value, placeholder, handleChangeText, otherStyles, keyboardType}) => {
    const [showPassword, setShowPassword] = useState(false)
    return (
        <View className={`space-y-2 ${otherStyles}`}>
            <Text className="text-base text-darkBrown font-pmedium">{title}</Text>

            <View className='w-full h-16 px-4 bg-darkBrown rounded-2xl focus:border-turqoise items-center flex-row'>
                <TextInput 
                    className="flex-1 text-bgc font-psemibold text-base"
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor="#7b7b8b"
                    onChangeText={handleChangeText}
                    keyboardType={keyboardType}
                    secureTextEntry={title === "Password" && !showPassword}
                />

                {title === "Password" && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Image
                            source={!showPassword ? icons.eye : icons.eyeHide}
                            className="w-6 h-6"
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                )}

            </View>
        </View>
    )
}

export default FormField