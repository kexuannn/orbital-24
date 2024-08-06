import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ShelterProfile from '../../app/(sheltertabs)/shelterProfile';
import { auth, db, storage } from '../../firebase.config';
import { doc, setDoc, getDoc, deleteDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

jest.mock('expo-router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  deleteDoc: jest.fn(),
  collection: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
}));

jest.mock('../../firebase.config', () => ({
  auth: {
    currentUser: {
      uid: 'shelter123',
      email: 'shelter@example.com',
      delete: jest.fn(),
    },
  },
  db: {},
  storage: {},
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

describe('ShelterProfile', () => {
  const mockedRouter = useRouter();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Profile page correctly', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        profilePicture: null,
        username: 'testShelter',
        email: 'shelter@example.com',
        number: '1234567890',
        address: '123 Shelter St',
        contactemail: 'contact@shelter.com',
        website: 'https://shelter.com',
        description: 'A friendly shelter',
        ratings: { count: 5, sum: 20 },
      }),
    });

    const { getByText, getByPlaceholderText } = render(<ShelterProfile />);

    await waitFor(() => {
      expect(getByText('Shelter Profile')).toBeTruthy();
      expect(getByText('Edit profile picture')).toBeTruthy();
      expect(getByPlaceholderText('Username:')).toBeTruthy();
      expect(getByText('Email: shelter@example.com')).toBeTruthy();
      expect(getByPlaceholderText('Contact Number:')).toBeTruthy();
      expect(getByPlaceholderText('Website:')).toBeTruthy();
      expect(getByPlaceholderText('Contact Email:')).toBeTruthy();
      expect(getByPlaceholderText('Address:')).toBeTruthy();
      expect(getByPlaceholderText('Short Description:')).toBeTruthy();
      expect(getByText('Save Profile')).toBeTruthy();
      expect(getByText('Delete Profile')).toBeTruthy();
    });
  });

  test('users are able to include or change their details and have them successfully saved in the database', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        profilePicture: null,
        username: 'testShelter',
        email: 'shelter@example.com',
        number: '1234567890',
        address: '123 Shelter St',
        contactemail: 'contact@shelter.com',
        website: 'https://shelter.com',
        description: 'A friendly shelter',
        ratings: { count: 5, sum: 20 },
      }),
    });

    const { getByPlaceholderText, getByText } = render(<ShelterProfile />);

    await waitFor(() => {
      fireEvent.changeText(getByPlaceholderText('Username:'), 'newShelterName');
      fireEvent.changeText(getByPlaceholderText('Contact Number:'), '0987654321');
      fireEvent.changeText(getByPlaceholderText('Website:'), 'https://newshelter.com');
      fireEvent.changeText(getByPlaceholderText('Contact Email:'), 'newcontact@shelter.com');
      fireEvent.changeText(getByPlaceholderText('Address:'), '456 Shelter Ave');
      fireEvent.changeText(getByPlaceholderText('Short Description:'), 'A great shelter');
    });

    fireEvent.press(getByText('Save Profile'));

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(expect.any(Object), {
        profilePicture: null,
        username: 'newShelterName',
        email: 'shelter@example.com',
        number: '0987654321',
        address: '456 Shelter Ave',
        contactemail: 'newcontact@shelter.com',
        website: 'https://newshelter.com',
        description: 'A great shelter',
        ratings: { count: 5, sum: 20 },
      });
      expect(getByText('Profile saved successfully!')).toBeTruthy();
    });
  });

  test('users are able to delete their profile and account if needed', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        profilePicture: 'profilePictures/shelter123/123456',
        username: 'testShelter',
        email: 'shelter@example.com',
        number: '1234567890',
        address: '123 Shelter St',
        contactemail: 'contact@shelter.com',
        website: 'https://shelter.com',
        description: 'A friendly shelter',
        ratings: { count: 5, sum: 20 },
      }),
    });

    const { getByText } = render(<ShelterProfile />);

    fireEvent.press(getByText('Delete Profile'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Profile',
        'Are you sure you want to delete your profile? This action cannot be undone.',
        expect.any(Array)
      );
    });

    // Simulate user confirming the deletion
    Alert.alert.mock.calls[0][2][1].onPress();

    await waitFor(() => {
      expect(deleteObject).toHaveBeenCalledWith(expect.any(Object));
      expect(deleteDoc).toHaveBeenCalledWith(expect.any(Object));
      expect(auth.currentUser.delete).toHaveBeenCalled();
      expect(mockedRouter.push).toHaveBeenCalledWith('/sign-up');
    });
  });
});
