import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PostShelterImage from '../../app/(sheltertabs)/shelterCreate'; 
import { db, auth, storage } from '../../firebase.config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  collection: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock('../../firebase.config', () => ({
  auth: {
    currentUser: {
      uid: 'shelter123',
      email: 'shelter@example.com',
    },
  },
  db: {},
  storage: {},
}));

describe('PostShelterImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly for shelters', async () => {
    const { getByText, getByPlaceholderText } = render(<PostShelterImage />);

    await waitFor(() => {
      expect(getByText('Share a post')).toBeTruthy();
      expect(getByText('Pick an image')).toBeTruthy();
      expect(getByPlaceholderText('Add a caption...')).toBeTruthy();
      expect(getByText('Post')).toBeTruthy();
    });
  });

  test('shows error prompt if no image is selected after clicking "pick an image"', async () => {
    ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({ canceled: true });

    const { getByText } = render(<PostShelterImage />);

    fireEvent.press(getByText('Pick an image'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('You did not select any image.');
    });
  });

  test('shows error if user attempts to post without selecting a picture', async () => {
    const { getByText } = render(<PostShelterImage />);

    fireEvent.press(getByText('Post'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('You must select an image and add a caption.');
    });
  });

  test('adds posts to the correct Firestore databases', async () => {
    const mockUri = 'mock-uri';
    const mockDownloadUrl = 'mock-download-url';

    ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: mockUri }] });
    uploadBytes.mockResolvedValueOnce(null);
    getDownloadURL.mockResolvedValueOnce(mockDownloadUrl);

    const mockUserDoc = { exists: jest.fn().mockReturnValue(true), data: jest.fn().mockReturnValue({ username: 'Test Shelter', profilePicture: 'http://example.com/profile.jpg' }) };
    getDoc.mockResolvedValueOnce(mockUserDoc);

    const { getByText, getByPlaceholderText, getByTestId } = render(<PostShelterImage />);

    fireEvent.press(getByText('Pick an image'));

    await waitFor(() => {
      expect(getByTestId('selected-image').props.source.uri).toBe(mockUri);
    });

    fireEvent.changeText(getByPlaceholderText('Add a caption...'), 'Test caption');

    fireEvent.press(getByText('Post'));

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
    });
  });
});
