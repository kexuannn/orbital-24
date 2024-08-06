import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import User from '../../app/(tabs)/user';
import { auth, db, storage } from '../../firebase.config';
import { useRouter } from 'expo-router';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
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
      uid: 'user123',
      email: 'user@example.com',
      delete: jest.fn(),
    },
  },
  db: {},
  storage: {},
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

describe('User', () => {
  const mockedRouter = useRouter();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Profile page correctly', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        profilePicture: null,
        username: 'testuser',
        email: 'user@example.com',
        contact: '1234567890',
        property: 'HDB',
        desiredPets: ['Dog'],
        current: ['Cat'],
      }),
    });

    const { getByText, getByPlaceholderText, getByRole } = render(<User />);

    await waitFor(() => {
      expect(getByText('User Profile')).toBeTruthy();
      expect(getByText('edit profile picture')).toBeTruthy();
      expect(getByPlaceholderText('Username:')).toBeTruthy();
      expect(getByText('Email: user@example.com')).toBeTruthy();
      expect(getByPlaceholderText('Contact Number:')).toBeTruthy();
      expect(getByText('Property Type:')).toBeTruthy();
      expect(getByText('Selected Property Type: HDB')).toBeTruthy();
      expect(getByText('Desired Pet Type(s):')).toBeTruthy();
      expect(getByText('Dog')).toBeTruthy();
      expect(getByText('Current Pet(s):')).toBeTruthy();
      expect(getByText('Cat')).toBeTruthy();
      expect(getByText('View bookmarked pets')).toBeTruthy();
      expect(getByText('View your posts')).toBeTruthy();
      expect(getByText('Save Profile')).toBeTruthy();
      expect(getByText('Delete Profile')).toBeTruthy();
    });
  });

  test('users are able to include or change their details and have them successfully saved in the database', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        profilePicture: null,
        username: 'testuser',
        email: 'user@example.com',
        contact: '1234567890',
        property: 'HDB',
        desiredPets: ['Dog'],
        current: ['Cat'],
      }),
    });

    const { getByPlaceholderText, getByText, getByRole } = render(<User />);

    await waitFor(() => {
      fireEvent.changeText(getByPlaceholderText('Username:'), 'newusername');
      fireEvent.changeText(getByPlaceholderText('Contact Number:'), '0987654321');
    });

    fireEvent.press(getByText('Save Profile'));

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(expect.any(Object), {
        profilePicture: null,
        username: 'newusername',
        email: 'user@example.com',
        contact: '0987654321',
        property: 'HDB',
        desiredPets: ['Dog'],
        current: ['Cat'],
      });
      expect(getByText('Profile saved successfully!')).toBeTruthy();
    });
  });

  test('users are able to view their posts when they click on the "View your posts" button', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        profilePicture: null,
        username: 'testuser',
        email: 'user@example.com',
        contact: '1234567890',
        property: 'HDB',
        desiredPets: ['Dog'],
        current: ['Cat'],
      }),
    });

    const { getByText } = render(<User />);

    fireEvent.press(getByText('View your posts'));

    await waitFor(() => {
      expect(mockedRouter.push).toHaveBeenCalledWith({
        pathname: 'viewyourposts',
        params: { userId: 'user123' },
      });
    });
  });

  test('users are able to view their bookmarked pets when they click on the "View bookmarked pets" button', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        profilePicture: null,
        username: 'testuser',
        email: 'user@example.com',
        contact: '1234567890',
        property: 'HDB',
        desiredPets: ['Dog'],
        current: ['Cat'],
      }),
    });

    const { getByText } = render(<User />);

    fireEvent.press(getByText('View bookmarked pets'));

    await waitFor(() => {
      expect(mockedRouter.push).toHaveBeenCalledWith('../bookmarked');
    });
  });

  test('users are able to delete their profile and account if needed', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        profilePicture: 'profilePictures/user123/123456',
        username: 'testuser',
        email: 'user@example.com',
        contact: '1234567890',
        property: 'HDB',
        desiredPets: ['Dog'],
        current: ['Cat'],
      }),
    });

    const { getByText } = render(<User />);

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
