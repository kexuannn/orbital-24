import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ShelterChatScreen from '../../app/(sheltertabs)/shelterLivechat'; 
import { db, database, auth } from '../../firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import { ref, push, onValue } from 'firebase/database';
import call from 'react-native-phone-call';

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  push: jest.fn(),
  onValue: jest.fn(),
}));

jest.mock('react-native-phone-call', () => jest.fn());

jest.mock('../../firebase.config', () => ({
  auth: {
    currentUser: {
      uid: 'shelter123',
    },
  },
  db: {},
  database: {},
}));

describe('ShelterChatScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Live Chat page correctly for shelters', async () => {
    getDoc.mockResolvedValueOnce({
      exists: jest.fn().mockReturnValue(true),
      data: jest.fn().mockReturnValue({ username: 'User Name', contact: '1234567890' }),
    });

    onValue.mockImplementation((ref, callback) => {
      callback({
        val: jest.fn().mockReturnValue({
          message1: { text: 'Hello', senderId: 'user123', timestamp: new Date().toISOString() },
        }),
      });
    });

    const { getByText, getByPlaceholderText } = render(<ShelterChatScreen />);
    await waitFor(() => {
      expect(getByText('You are currently chatting with User Name')).toBeTruthy();
      expect(getByText('Hello')).toBeTruthy();
      expect(getByPlaceholderText('Type a message...')).toBeTruthy();
    });
  });

  test('message input field updates correctly as the user types', () => {
    const { getByPlaceholderText } = render(<ShelterChatScreen />);
    const inputField = getByPlaceholderText('Type a message...');

    fireEvent.changeText(inputField, 'Test message');
    expect(inputField.props.value).toBe('Test message');
  });

  test('send button triggers the correct function to send a message', async () => {
    const { getByPlaceholderText, getByText } = render(<ShelterChatScreen />);
    const inputField = getByPlaceholderText('Type a message...');

    fireEvent.changeText(inputField, 'Test message');
    fireEvent.press(getByText('Send'));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(expect.anything(), {
        text: 'Test message',
        timestamp: expect.any(String),
        senderId: 'shelter123',
      });
    });
  });

  test('sent and received messages are displayed correctly in the FlatList', async () => {
    getDoc.mockResolvedValueOnce({
      exists: jest.fn().mockReturnValue(true),
      data: jest.fn().mockReturnValue({ username: 'User Name', contact: '1234567890' }),
    });

    onValue.mockImplementation((ref, callback) => {
      callback({
        val: jest.fn().mockReturnValue({
          message1: { text: 'Hello', senderId: 'user123', timestamp: new Date().toISOString() },
          message2: { text: 'Hi', senderId: 'shelter123', timestamp: new Date().toISOString() },
        }),
      });
    });

    const { getByText } = render(<ShelterChatScreen />);
    await waitFor(() => {
      expect(getByText('Hello')).toBeTruthy();
      expect(getByText('Hi')).toBeTruthy();
    });
  });

  test('calling feature functions correctly', async () => {
    getDoc.mockResolvedValueOnce({
      exists: jest.fn().mockReturnValue(true),
      data: jest.fn().mockReturnValue({ username: 'User Name', contact: '1234567890' }),
    });

    const { getByTestId } = render(<ShelterChatScreen />);

    const callButton = getByTestId('call-button');
    fireEvent.press(callButton);

    await waitFor(() => {
      expect(call).toHaveBeenCalledWith({
        number: '1234567890',
        prompt: true,
      });
    });
  });

  test('displays error message when contact number is empty', async () => {
    getDoc.mockResolvedValueOnce({
      exists: jest.fn().mockReturnValue(true),
      data: jest.fn().mockReturnValue({ username: 'User Name', contact: '' }),
    });

    const { getByTestId } = render(<ShelterChatScreen />);

    const callButton = getByTestId('call-button');
    fireEvent.press(callButton);

    await waitFor(() => {
      expect(call).not.toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith("Error", "No phone number available.");
    });
  });
});
