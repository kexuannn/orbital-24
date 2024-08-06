import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import MapScreen from '../../app/(tabs)/maps';
import axios from 'axios';
import { db } from '../../firebase.config';
import { collection, getDocs } from 'firebase/firestore';
import * as Location from 'expo-location';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('axios');

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('../../firebase.config', () => ({
  db: {},
}));

describe('MapScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the map component correctly', async () => {
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: 'shelter1',
          data: () => ({
            username: 'Shelter 1',
            address: '123 Shelter St',
            description: 'A shelter for pets',
            ratings: { count: 5, sum: 25 },
          }),
        },
      ],
    });

    axios.get.mockResolvedValueOnce({
      data: [
        {
          lat: '1.3521',
          lon: '103.8198',
        },
      ],
    });

    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: 'granted',
    });

    Location.getCurrentPositionAsync.mockResolvedValueOnce({
      coords: {
        latitude: 1.3521,
        longitude: 103.8198,
      },
    });

    const { getByText, getByTestId } = render(<MapScreen />);

    await waitFor(() => {
      expect(getByText('Map of shelters')).toBeTruthy();
    });
  });

  test('dynamically renders markers based on fetched shelter data', async () => {
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: 'shelter1',
          data: () => ({
            username: 'Shelter 1',
            address: '123 Shelter St',
            description: 'A shelter for pets',
            ratings: { count: 5, sum: 25 },
          }),
        },
      ],
    });

    axios.get.mockResolvedValueOnce({
      data: [
        {
          lat: '1.3521',
          lon: '103.8198',
        },
      ],
    });

    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: 'granted',
    });

    Location.getCurrentPositionAsync.mockResolvedValueOnce({
      coords: {
        latitude: 1.3521,
        longitude: 103.8198,
      },
    });

    const { getByText } = render(<MapScreen />);

    await waitFor(() => {
      expect(getByText('Shelter 1')).toBeTruthy();
      expect(getByText('123 Shelter St')).toBeTruthy();
      expect(getByText('A shelter for pets')).toBeTruthy();
      expect(getByText('Rating: 5.0')).toBeTruthy();
    });
  });

  test('fetches and displays shelter data correctly, including ratings and descriptions', async () => {
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: 'shelter1',
          data: () => ({
            username: 'Shelter 1',
            address: '123 Shelter St',
            description: 'A shelter for pets',
            ratings: { count: 5, sum: 25 },
          }),
        },
      ],
    });

    axios.get.mockResolvedValueOnce({
      data: [
        {
          lat: '1.3521',
          lon: '103.8198',
        },
      ],
    });

    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: 'granted',
    });

    Location.getCurrentPositionAsync.mockResolvedValueOnce({
      coords: {
        latitude: 1.3521,
        longitude: 103.8198,
      },
    });

    const { getByText } = render(<MapScreen />);

    await waitFor(() => {
      expect(getByText('Shelter 1')).toBeTruthy();
      expect(getByText('123 Shelter St')).toBeTruthy();
      expect(getByText('A shelter for pets')).toBeTruthy();
      expect(getByText('Rating: 5.0')).toBeTruthy();
    });
  });

  test('fetches address data correctly from the shelters collection in Firestore', async () => {
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: 'shelter1',
          data: () => ({
            username: 'Shelter 1',
            address: '123 Shelter St',
            description: 'A shelter for pets',
            ratings: { count: 5, sum: 25 },
          }),
        },
      ],
    });

    axios.get.mockResolvedValueOnce({
      data: [
        {
          lat: '1.3521',
          lon: '103.8198',
        },
      ],
    });

    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: 'granted',
    });

    Location.getCurrentPositionAsync.mockResolvedValueOnce({
      coords: {
        latitude: 1.3521,
        longitude: 103.8198,
      },
    });

    const { getByText } = render(<MapScreen />);

    await waitFor(() => {
      expect(getByText('Shelter 1')).toBeTruthy();
      expect(getByText('123 Shelter St')).toBeTruthy();
    });
  });
});
