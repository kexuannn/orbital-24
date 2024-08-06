import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ShelterProfile from '../../app/(tabs)/viewshelterprofile';
import { db } from '../../firebase.config';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { Rating } from 'react-native-ratings';

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  increment: jest.fn(),
}));

jest.mock('react-native-ratings', () => ({
  Rating: jest.fn().mockReturnValue(null),
}));

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
}));

jest.mock('../../firebase.config', () => ({
  db: {},
}));

describe('ShelterProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders shelter profile correctly', async () => {
    getDoc.mockResolvedValueOnce({
      exists: jest.fn().mockReturnValue(true),
      data: jest.fn().mockReturnValue({
        username: 'Shelter Name',
        profilePicture: 'https://example.com/profile.jpg',
        address: '123 Shelter St',
        contactemail: 'shelter@example.com',
        number: '123-456-7890',
        website: 'shelterwebsite.com',
        description: 'A shelter description',
        ratings: {
          sum: 10,
          count: 2,
        },
      }),
    });

    const { getByText, getByTestId } = render(<ShelterProfile route={{ params: { userId: 'shelter123' } }} />);

    await waitFor(() => {
      expect(getByText('Shelter Name')).toBeTruthy();
      expect(getByText('Address: 123 Shelter St')).toBeTruthy();
      expect(getByText('Email: shelter@example.com')).toBeTruthy();
      expect(getByText('Number: 123-456-7890')).toBeTruthy();
      expect(getByText('Website: shelterwebsite.com')).toBeTruthy();
      expect(getByText('Description of shelter: A shelter description')).toBeTruthy();
      expect(getByText('Average Rating: 5.0 / 5')).toBeTruthy();
    });
  });

  test('handles rating submission correctly', async () => {
    const mockUpdateDoc = jest.fn();
    updateDoc.mockImplementation(mockUpdateDoc);
    getDoc.mockResolvedValueOnce({
      exists: jest.fn().mockReturnValue(true),
      data: jest.fn().mockReturnValue({
        username: 'Shelter Name',
        ratings: {
          sum: 10,
          count: 2,
        },
      }),
    });

    const { getByText, getByTestId } = render(<ShelterProfile route={{ params: { userId: 'shelter123' } }} />);
    
    await waitFor(() => {
      expect(getByText('Shelter Name')).toBeTruthy();
    });

    const ratingComponent = getByTestId('rating-component');
    fireEvent(ratingComponent, 'finishRating', 5);

    const rateButton = getByText('Rate!');
    fireEvent.press(rateButton);

    await waitFor(() => {
      expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), {
        'ratings.sum': increment(5),
        'ratings.count': increment(1),
      });
    });
  });

  test('handles no rating case correctly', async () => {
    getDoc.mockResolvedValueOnce({
      exists: jest.fn().mockReturnValue(true),
      data: jest.fn().mockReturnValue({
        username: 'Shelter Name',
      }),
    });

    const { getByText } = render(<ShelterProfile route={{ params: { userId: 'shelter123' } }} />);

    await waitFor(() => {
      expect(getByText('Average Rating: 0.0 / 5')).toBeTruthy();
    });
  });
});
