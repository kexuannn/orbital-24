import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import FilterResults from '../../app/(tabs)/FilterResults';
import { db } from '../../firebase.config';
import { collection, getDocs, query, where } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock('../../firebase.config', () => ({
  db: {},
}));

describe('FilterResults', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays filtered pet listings correctly', async () => {
    const mockData = [
      {
        id: 'pet1',
        species: 'Dog',
        property: 'HDB',
        age: 5,
        createdAt: {
          toDate: () => new Date(),
        },
      },
    ];

    getDocs.mockResolvedValueOnce({
      docs: mockData.map((data) => ({
        id: data.id,
        data: () => data,
      })),
    });

    const { getByText } = render(<FilterResults post={['pet1']} />);

    await waitFor(() => {
      expect(getByText('Dog')).toBeTruthy();
      expect(getByText('HDB')).toBeTruthy();
      expect(getByText('5')).toBeTruthy();
    });
  });

  test('handles no results case correctly', async () => {
    getDocs.mockResolvedValueOnce({
      docs: [],
    });

    const { getByText } = render(<FilterResults post={[]} />);

    await waitFor(() => {
      expect(getByText('No results found.')).toBeTruthy();
    });
  });
});
