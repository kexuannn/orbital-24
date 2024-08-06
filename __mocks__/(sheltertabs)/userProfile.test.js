import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import UserProfile from '../../app/(sheltertabs)/userProfile';
import { db } from '../../firebase.config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('../../firebase.config', () => ({
  db: {},
}));

describe('UserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders user profile correctly', async () => {
    getDoc.mockResolvedValueOnce({
      exists: jest.fn().mockReturnValue(true),
      data: jest.fn().mockReturnValue({
        username: 'User Name',
        profilePicture: 'https://example.com/profile.jpg',
        desiredPets: ['Dog', 'Cat'],
        current: ['Bird'],
      }),
    });

    getDocs.mockResolvedValueOnce({
      docs: [],
    });

    const { getByText, getByTestId } = render(<UserProfile route={{ params: { userId: 'user123' } }} />);

    await waitFor(() => {
      expect(getByText('User Name')).toBeTruthy();
      expect(getByText('Desired pets:')).toBeTruthy();
      expect(getByText('Dog')).toBeTruthy();
      expect(getByText('Cat')).toBeTruthy();
      expect(getByText('Current pets:')).toBeTruthy();
      expect(getByText('Bird')).toBeTruthy();
    });
  });

  test('renders user posts correctly', async () => {
    getDoc.mockResolvedValueOnce({
      exists: jest.fn().mockReturnValue(true),
      data: jest.fn().mockReturnValue({
        username: 'User Name',
        profilePicture: 'https://example.com/profile.jpg',
      }),
    });

    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: 'post1',
          data: jest.fn().mockReturnValue({
            imageUrl: 'https://example.com/post1.jpg',
            caption: 'First post',
          }),
        },
        {
          id: 'post2',
          data: jest.fn().mockReturnValue({
            imageUrl: 'https://example.com/post2.jpg',
            caption: 'Second post',
          }),
        },
      ],
    });

    const { getByText, getByTestId } = render(<UserProfile route={{ params: { userId: 'user123' } }} />);

    await waitFor(() => {
      expect(getByText('First post')).toBeTruthy();
      expect(getByText('Second post')).toBeTruthy();
    });
  });

  test('handles case when user data is not found', async () => {
    getDoc.mockResolvedValueOnce({
      exists: jest.fn().mockReturnValue(false),
    });

    const { getByText } = render(<UserProfile route={{ params: { userId: 'user123' } }} />);

    await waitFor(() => {
      expect(getByText('User not found')).toBeTruthy();
    });
  });
});
