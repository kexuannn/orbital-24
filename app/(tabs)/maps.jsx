import React, { useEffect, useState } from 'react';
import MapView, { Marker, Callout } from 'react-native-maps';
import { View, Text } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import { db } from '../../firebase.config';
import { collection, getDocs } from 'firebase/firestore';

const NOMINATIM_USER_AGENT = 'PawsConnect/1.0 (lee.minrui1@gmail.com)';

const MapScreen = () => {
  const [shelters, setShelters] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const shelterCollection = collection(db, 'shelters');
        const shelterSnapshot = await getDocs(shelterCollection);
        const shelterList = await Promise.all(
          shelterSnapshot.docs.map(async (doc) => {
            const shelter = doc.data();
            if (shelter.address) {
              const { lat, lon } = await getCoordinates(shelter.address);
              return { ...shelter, latitude: lat, longitude: lon };
            }
            return shelter;
          })
        );
        setShelters(shelterList);
      } catch (error) {
        console.error('Error fetching shelters:', error);
      }
    };

    const fetchCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    };

    fetchShelters();
    fetchCurrentLocation();
  }, []);

  const getCoordinates = async (address) => {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          addressdetails: 1,
        },
        headers: {
          'User-Agent': NOMINATIM_USER_AGENT,
        },
      });
      const location = response.data[0];
      return location ? { lat: parseFloat(location.lat), lon: parseFloat(location.lon) } : { lat: 0, lon: 0 };
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return { lat: 0, lon: 0 }; // Default to 0,0 on error
    }
  };

  return (
    <View className="w-full h-full flex-1 bg-bgc">
      <View className="items-center justify-center">
        <Text className="text-turqoise font-gb mt-14 text-5xl">
          Map of shelters
        </Text>
      </View>

      <MapView
        className="w-full h-full"
        initialRegion={{
          latitude: currentLocation?.latitude || 1.3521, // Default to Singapore if current location is not available
          longitude: currentLocation?.longitude || 103.8198,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {shelters.map((shelter, index) => (
          shelter.latitude && shelter.longitude ? (
            <Marker
              key={index}
              coordinate={{
                latitude: shelter.latitude,
                longitude: shelter.longitude,
              }}
              title={shelter.username}
              description={shelter.address}
            >
              <Callout>
                <View className="w-60 p-3 bg-white rounded-lg">
                  <Text className="text-lg font-bold">{shelter.username}</Text>
                  <Text className="text-sm text-gray-600 mb-2">{shelter.address}</Text>
                  <Text className="text-sm mb-2">{shelter.description || 'No description available'}</Text>
                  <Text className="text-sm font-bold">
                    {shelter.ratings && shelter.ratings.count > 0
                      ? `Rating: ${(shelter.ratings.sum / shelter.ratings.count).toFixed(1)}`
                      : 'No rating available'}
                  </Text>

                </View>
              </Callout>
            </Marker>
          ) : null
        ))}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Location"
            pinColor="blue"
          >
            <Callout>
              <View className="w-60 p-3 bg-white rounded-lg">
                <Text className="text-lg font-bold">Your Location</Text>
              </View>
            </Callout>
          </Marker>
        )}
      </MapView>
    </View>
  );
};

export default MapScreen;
