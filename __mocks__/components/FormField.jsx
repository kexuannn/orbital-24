// __mocks__/FormField.js

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';

// Define the mock implementation
const MockFormField = ({ title, value, placeholder, handleChangeText, otherStyles, keyboardType }) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <View style={{ marginVertical: 8, ...otherStyles }}>
      <Text>{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 8, height: 48 }}>
        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7b7b8b"
          onChangeText={handleChangeText}
          keyboardType={keyboardType}
          secureTextEntry={title === "Password" && !showPassword}
          style={{ flex: 1 }}
        />
        {title === "Password" && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={showPassword ? require('../assets/icons/eyeHide.png') : require('../assets/icons/eye.png')}  // Use actual mock image paths
              style={{ width: 24, height: 24 }}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default MockFormField;
