import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatScreen from '../../app/(tabs)/livechat';
import { db, database, auth } from '../../firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import { ref, push, onValue } from 'firebase/database';

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  push: jest.fn(),
  onValue: jest.fn(),
}));

jest.mock('../../firebase.config', () => ({
  auth: {
    currentUser: {
      uid: 'user123',
    },
  },
  db: {},
  database: {},
}));

describe('ChatScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Live Chat page correctly for adopters', async () => {
    getDoc.mockResolvedValueOnce({
      exists: jest.fn().mockReturnValue(true),
      data: jest.fn().mockReturnValue({ username: 'Shelter Name' }),
    });

    onValue.mockImplementation((ref, callback) => {
      callback({
        val: jest.fn().mockReturnValue({
          message1: { text: 'Hello', senderId: 'shelter123', timestamp: new Date().toISOString() },
        }),
      });
    });

    const { getByText, getByPlaceholderText } = render(<ChatScreen />);
    await waitFor(() => {
      expect(getByText('You are currently chatting with Shelter Name')).toBeTruthy();
      expect(getByText('Hello')).toBeTruthy();
      expect(getByPlaceholderText('Type a message...')).toBeTruthy();
    });
  });

  test('message input field updates correctly as the user types', () => {
    const { getByPlaceholderText } = render(<ChatScreen />);
    const inputField = getByPlaceholderText('Type a message...');

    fireEvent.changeText(inputField, 'Test message');
    expect(inputField.props.value).toBe('Test message');
  });

  test('send button triggers the correct function to send a message', async () => {
    const { getByPlaceholderText, getByText } = render(<ChatScreen />);
    const inputField = getByPlaceholderText('Type a message...');

    fireEvent.changeText(inputField, 'Test message');
    fireEvent.press(getByText('Send'));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(expect.anything(), {
        text: 'Test message',
        timestamp: expect.any(String),
        senderId: 'user123',
      });
    });
  });

  test('sent and received messages are displayed correctly in the FlatList', async () => {
    getDoc.mockResolvedValueOnce({
      exists: jest.fn().mockReturnValue(true),
      data: jest.fn().mockReturnValue({ username: 'Shelter Name' }),
    });

    onValue.mockImplementation((ref, callback) => {
      callback({
        val: jest.fn().mockReturnValue({
          message1: { text: 'Hello', senderId: 'shelter123', timestamp: new Date().toISOString() },
          message2: { text: 'Hi', senderId: 'user123', timestamp: new Date().toISOString() },
        }),
      });
    });

    const { getByText } = render(<ChatScreen />);
    await waitFor(() => {
      expect(getByText('Hello')).toBeTruthy();
      expect(getByText('Hi')).toBeTruthy();
    });
  });
});
