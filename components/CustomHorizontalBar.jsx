import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const HorizontalBar = ({ data, optionalParameter }) => {
  const navigation = useNavigation();
  const route = useRoute();

  const isActive = (screenName) => {
    return screenName === route.name;
  };

  return (
    <View style={{ width: '100%' }}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0, marginHorizontal: 0 }}
      >
        {/* Ensure data is defined and map over it */}
        {data && data.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => navigation.navigate(item.screen, { optionalParameter })}
            style={{
              paddingHorizontal: 30,
              paddingVertical: 10,
              backgroundColor: isActive(item.screen) ? '#416F82' : 'white',
            }}
          >
            <Text style={{ fontSize: 16, color: isActive(item.screen) ? '#F2E9CD' : '#463939', fontWeight: '500' }}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default HorizontalBar;
