import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Search from '../../app/(tabs)/search';
import { db, auth } from '../../firebase.config';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock('../../firebase.config', () => ({
  auth: {
    currentUser: {
      uid: 'user123',
    },
  },
  db: {},
}));

describe('Search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders search bar component correctly', async () => {
    const { getByPlaceholderText } = render(<Search />);

    await waitFor(() => {
      expect(getByPlaceholderText('Search pets...')).toBeTruthy();
    });
  });

  test('search bar updates state correctly on input', async () => {
    const { getByPlaceholderText } = render(<Search />);

    const searchBar = getByPlaceholderText('Search pets...');
    fireEvent.changeText(searchBar, 'Dog');

    await waitFor(() => {
      expect(searchBar.props.value).toBe('Dog');
    });
  });

  test('pressing the search button triggers the search function', async () => {
    const mockData = [
      {
        id: 'pet1',
        species: 'Dog',
      },
    ];

    getDocs.mockResolvedValueOnce({
      docs: mockData.map((data) => ({
        id: data.id,
        data: () => data,
      })),
    });

    const { getByPlaceholderText, getByText } = render(<Search />);
    const searchBar = getByPlaceholderText('Search pets...');
    fireEvent.changeText(searchBar, 'Dog');
    fireEvent.press(getByText('Search'));

    await waitFor(() => {
      expect(getByText('Matching document IDs: pet1')).toBeTruthy();
    });
  });

  test('pet listings are retrieved based on preferences specified in adopters profiles', async () => {
    const mockUserData = {
      desiredPets: ['Dog'],
      property: 'HDB',
    };

    getDoc.mockResolvedValueOnce({
      exists: jest.fn().mockReturnValue(true),
      data: jest.fn().mockReturnValue(mockUserData),
    });

    const mockData = [
      {
        id: 'pet1',
        species: 'Dog',
        property: 'HDB',
        age: 5,
      },
    ];

    getDocs.mockResolvedValueOnce({
      docs: mockData.map((data) => ({
        id: data.id,
        data: () => data,
      })),
    });

    const { getByText } = render(<Search />);

    await waitFor(() => {
      expect(getByText('Matching document IDs: pet1')).toBeTruthy();
    });
  });

  test('handles edge cases where there are no results', async () => {
    getDocs.mockResolvedValueOnce({
      docs: [],
    });

    const { getByText, getByPlaceholderText } = render(<Search />);

    const searchBar = getByPlaceholderText('Search pets...');
    fireEvent.changeText(searchBar, 'Unicorn');
    fireEvent.press(getByText('Search'));

    await waitFor(() => {
      expect(getByText('No results found.')).toBeTruthy();
    });
  });
});
