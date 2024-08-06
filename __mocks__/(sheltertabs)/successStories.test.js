import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Success from '../../app/(sheltertabs)/successStories';
import { db, auth } from '../../firebase.config';
import { doc, getDocs, collection, getDoc, deleteDoc } from 'firebase/firestore';
import HorizontalBar from '../../components/CustomHorizontalBar';
import LikeButton from '../../components/CustomLikeButton';
import CommentSection from '../../components/Comments';

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDocs: jest.fn(),
  collection: jest.fn(),
  getDoc: jest.fn(),
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
jest.mock('../../components/Comments', () => jest.fn());

describe('Success', () => {
  const mockSuccessData = [
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

    getDocs.mockResolvedValueOnce({
      docs: mockSuccessData.map((data) => ({
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
    CommentSection.mockReturnValue(null);
  });

  test('renders correctly for shelters', async () => {
    const { getByText, getByTestId } = render(<Success />);

    await waitFor(() => {
      expect(getByText('Test Shelter')).toBeTruthy();
      expect(HorizontalBar).toHaveBeenCalled();
      expect(getByTestId('success-stories')).toBeTruthy();
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

    const { getByTestId } = render(<Success />);

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

  test('allows users to comment on posts', async () => {
    const mockComment = 'Great post!';
    const addComment = jest.fn();

    CommentSection.mockImplementation(({ postId }) => (
      <View>
        <TextInput
          testID={`comment-input-${postId}`}
          onChangeText={addComment}
          value={mockComment}
        />
        <Button
          testID={`submit-comment-${postId}`}
          title="Add Comment"
          onPress={addComment}
        />
        <Text testID={`comment-${postId}-1`}>{mockComment}</Text>
      </View>
    ));

    const { getByTestId } = render(<Success />);

    fireEvent.changeText(getByTestId('comment-input-post1'), mockComment);
    fireEvent.press(getByTestId('submit-comment-post1'));

    await waitFor(() => {
      expect(addComment).toHaveBeenCalledWith(mockComment);
      expect(getByTestId('comment-post1-1').props.children).toBe(mockComment);
    });
  });

  test('allows users to delete their own comments', async () => {
    const mockComment = 'Great post!';
    const deleteComment = jest.fn();

    CommentSection.mockImplementation(({ postId }) => (
      <View>
        <TextInput
          testID={`comment-input-${postId}`}
          onChangeText={jest.fn()}
          value={mockComment}
        />
        <Button
          testID={`submit-comment-${postId}`}
          title="Add Comment"
          onPress={jest.fn()}
        />
        <View>
          <Text testID={`comment-${postId}-1`}>{mockComment}</Text>
          <Button
            testID={`delete-comment-${postId}-1`}
            title="Delete"
            onPress={deleteComment}
          />
        </View>
      </View>
    ));

    const { getByTestId, queryByTestId } = render(<Success />);

    fireEvent.press(getByTestId('delete-comment-post1-1'));

    await waitFor(() => {
      expect(deleteComment).toHaveBeenCalled();
      expect(queryByTestId('comment-post1-1')).toBeNull();
    });
  });
});
