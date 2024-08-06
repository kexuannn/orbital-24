import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Fundraising from '../../app/(sheltertabs)/fundraising'; 
import { db, auth } from '../../firebase.config';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import HorizontalBar from '../../components/CustomHorizontalBar';
import LikeButton from '../../components/CustomLikeButton';

jest.mock('firebase/firestore', () => ({
  onSnapshot: jest.fn(),
  doc: jest.fn(),
  collection: jest.fn(),
  deleteDoc: jest.fn(),
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

describe('Fundraising', () => {
  const mockFundraisingData = [
    {
      id: 'post1',
      data: {
        userId: 'shelter123',
        username: 'Test Shelter',
        profilePicture: 'http://example.com/profile.jpg',
        imageUrl: 'http://example.com/image.jpg',
        caption: 'Test caption',
        createdAt: { toDate: () => new Date() },
        likedBy: [],
      },
    },
  ];

  const mockShelterData = {
    username: 'Test Shelter',
    profilePicture: 'http://example.com/profile.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    onSnapshot.mockImplementation((query, callback) => {
      if (query._query.path.segments[1] === 'fundraising') {
        callback({
          docs: mockFundraisingData.map((data) => ({
            id: data.id,
            data: () => data.data,
          })),
        });
      } else if (query._key.path.segments[1] === 'shelters') {
        callback({
          exists: () => true,
          data: () => mockShelterData,
        });
      }
      return jest.fn();
    });

    HorizontalBar.mockReturnValue(null);
    LikeButton.mockReturnValue(null);
  });

  test('renders correctly for shelters', async () => {
    const { getByText, getByTestId } = render(<Fundraising />);

    await waitFor(() => {
      expect(getByText('Test Shelter')).toBeTruthy();
      expect(HorizontalBar).toHaveBeenCalled();
      expect(getByTestId('fundraising-posts')).toBeTruthy();
    });
  });

  test('allows users to like/unlike posts', async () => {
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

    const { getByTestId } = render(<Fundraising />);

    await waitFor(() => {
      expect(getByTestId('like-button-post1')).toBeTruthy();
      expect(getByTestId('like-count-post1').props.children).toBe(0);
    });

    fireEvent.press(getByTestId('like-button-post1'));

    await waitFor(() => {
      expect(getByTestId('like-count-post1').props.children).toBe(1);
    });

    fireEvent.press(getByTestId('like-button-post1'));

    await waitFor(() => {
      expect(getByTestId('like-count-post1').props.children).toBe(0);
    });
  });
});
