import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PetListing from '../../app/(sheltertabs)/shelterHome';
import { db, auth } from '../../firebase.config';
import { doc, getDocs, collection, getDoc, updateDoc } from 'firebase/firestore';
import HorizontalBar from '../../components/CustomHorizontalBar';
import LikeButton from '../../components/CustomLikeButton';

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDocs: jest.fn(),
  collection: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

jest.mock('../../firebase.config', () => ({
  auth: {
    currentUser: {
      uid: 'shelter123',
      email: 'shelter@example.com',
    },
  },
  db: {},
}));

jest.mock('../../components/CustomHorizontalBar', () => jest.fn());
jest.mock('../../components/CustomLikeButton', () => jest.fn());
jest.mock('../../components/CustomDeletePostButton', () => jest.fn());
jest.mock('../../components/EmailButton', () => jest.fn());

describe('PetListing', () => {
  const mockPetData = [
    {
      id: 'pet1',
      data: {
        userId: 'shelter123',
        username: 'Test Shelter',
        profilePicture: 'http://example.com/profile.jpg',
        imageUrl: 'http://example.com/image.jpg',
        caption: 'Test caption',
        createdAt: { toDate: () => new Date() },
        likedBy: [],
        name: 'Test Pet',
        age: '2',
        sex: 'Male',
        species: 'Dog',
        breed: 'Labrador',
        property: 'Condominium',
        status: 'available',
      },
    },
  ];

  const mockShelterData = {
    username: 'Test Shelter',
    profilePicture: 'http://example.com/profile.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    getDocs.mockResolvedValueOnce({
      docs: mockPetData.map((data) => ({
        id: data.id,
        data: () => data.data,
      })),
    });

    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => mockShelterData,
    });

    HorizontalBar.mockReturnValue(null);
    LikeButton.mockReturnValue(null);
  });

  test('renders correctly for shelters', async () => {
    const { getByText, getByTestId } = render(<PetListing />);

    await waitFor(() => {
      expect(getByText('Test Shelter')).toBeTruthy();
      expect(HorizontalBar).toHaveBeenCalled();
      expect(getByTestId('pet-listing-posts')).toBeTruthy();
    });
  });

  test('shelters can toggle the adoption status of pets from their listing', async () => {
    const { getByText } = render(<PetListing />);

    await waitFor(() => {
      expect(getByText('Status: available')).toBeTruthy();
    });

    fireEvent.press(getByText('Toggle Status'));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalled();
      expect(getByText('Status: pending adoption')).toBeTruthy();
    });

    fireEvent.press(getByText('Toggle Status'));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalled();
      expect(getByText('Status: adopted')).toBeTruthy();
    });
  });

  test('pet listings can be bookmarked by adopters', async () => {
    const mockBookmark = jest.fn();

    LikeButton.mockImplementation(({ postId, collectionName, initialLikes }) => (
      <TouchableOpacity onPress={mockBookmark} testID={`bookmark-button-${postId}`}>
        <Text>Bookmark</Text>
      </TouchableOpacity>
    ));

    const { getByTestId } = render(<PetListing />);

    fireEvent.press(getByTestId('bookmark-button-pet1'));

    await waitFor(() => {
      expect(mockBookmark).toHaveBeenCalled();
    });
  });

  test('likes count of listings changes accordingly when a user likes/unlikes a post', async () => {
    let isLiked = false;
    const toggleLike = () => {
      isLiked = !isLiked;
    };
    LikeButton.mockImplementation(({ postId, collectionName, initialLikes }) => (
      <TouchableOpacity onPress={toggleLike} testID={`like-button-${postId}`}>
        <Text>{isLiked ? 'Unlike' : 'Like'}</Text>
        <Text testID={`like-count-${postId}`}>{initialLikes + (isLiked ? 1 : 0)}</Text>
      </TouchableOpacity>
    ));

    const { getByTestId } = render(<PetListing />);

    await waitFor(() => {
      expect(getByTestId('like-button-pet1')).toBeTruthy();
      expect(getByTestId('like-count-pet1').props.children).toBe(0);
    });

    fireEvent.press(getByTestId('like-button-pet1'));

    await waitFor(() => {
      expect(getByTestId('like-count-pet1').props.children).toBe(1);
    });

    fireEvent.press(getByTestId('like-button-pet1'));

    await waitFor(() => {
      expect(getByTestId('like-count-pet1').props.children).toBe(0);
    });
  });

  test('details of pet listings can be hidden/shown by users', async () => {
    const { getByText, queryByText } = render(<PetListing />);

    fireEvent.press(getByText('Show Details'));

    await waitFor(() => {
      expect(getByText('Name: Test Pet')).toBeTruthy();
      expect(getByText('Age (in years): 2')).toBeTruthy();
      expect(getByText('Sex: Male')).toBeTruthy();
      expect(getByText('Species: Dog')).toBeTruthy();
      expect(getByText('Breed: Labrador')).toBeTruthy();
      expect(getByText('Property Type: Condominium')).toBeTruthy();
    });

    fireEvent.press(getByText('Hide Details'));

    await waitFor(() => {
      expect(queryByText('Name: Test Pet')).toBeNull();
      expect(queryByText('Age (in years): 2')).toBeNull();
      expect(queryByText('Sex: Male')).toBeNull();
      expect(queryByText('Species: Dog')).toBeNull();
      expect(queryByText('Breed: Labrador')).toBeNull();
      expect(queryByText('Property Type: Condominium')).toBeNull();
    });
  });
});
