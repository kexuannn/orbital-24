import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FilterPage from '../../app/(tabs)/filter'; 
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

describe('FilterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders filter components correctly', async () => {
    const { getByText, getByTestId } = render(<FilterPage />);

    await waitFor(() => {
      expect(getByText('Select Filters')).toBeTruthy();
      expect(getByText('Species')).toBeTruthy();
      expect(getByText('Property Type')).toBeTruthy();
      expect(getByText('Age Range (in years)')).toBeTruthy();
    });
  });

  test('updates age range labels correctly when sliders are adjusted', async () => {
    const { getByText, getAllByRole } = render(<FilterPage />);

    const minSlider = getAllByRole('slider')[0];
    const maxSlider = getAllByRole('slider')[1];

    fireEvent(minSlider, 'valueChange', 5);
    fireEvent(maxSlider, 'valueChange', 15);

    await waitFor(() => {
      expect(getByText('5')).toBeTruthy();
      expect(getByText('15')).toBeTruthy();
    });
  });

  test('selecting and deselecting tags updates the filter criteria correctly', async () => {
    const { getByText } = render(<FilterPage />);

    fireEvent.press(getByText('Dog'));

    await waitFor(() => {
      expect(getByText('Dog')).toHaveStyle({ backgroundColor: '#416F82' });
    });

    fireEvent.press(getByText('Dog'));

    await waitFor(() => {
      expect(getByText('Dog')).not.toHaveStyle({ backgroundColor: '#416F82' });
    });
  });

  test('adjusting the picker updates the property type correctly', async () => {
    const { getByText, getByTestId } = render(<FilterPage />);

    fireEvent(getByTestId('custom-picker'), 'valueChange', 'HDB');

    await waitFor(() => {
      expect(getByText('Selected Property Type: HDB')).toBeTruthy();
    });
  });

  test('filtered pet listings are displayed correctly based on applied filters', async () => {
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

    const { getByText, getByTestId } = render(<FilterPage />);
    fireEvent.press(getByTestId('apply-filters-button'));

    await waitFor(() => {
      expect(getByText('Matching document IDs: pet1')).toBeTruthy();
    });
  });
});
