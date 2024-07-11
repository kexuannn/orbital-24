import React, { useState } from 'react';
import { View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CustomPicker = ({ selectedValue, onValueChange, items }) => {

    return (
        <View>
            <Picker
                selectedValue={selectedValue}
                onValueChange={onValueChange}
                itemStyle={{ fontFamily : "Poppins-Medium", fontSize: 16 }} 
            >
                {items.map((item, index) => (
                    <Picker.Item key={index} label={item.label} value={item.value} color="#463939" fontSize="" />
                ))}
            </Picker>
        </View>
    );
};

export default CustomPicker;
