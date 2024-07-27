import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignIn from '../app/(auth)/sign-in';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// Ensure that the mocked modules are used
jest.mock('firebase/auth');
jest.mock('expo-router');
jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
}));

describe('SignIn Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<SignIn />);

    expect(getByText('Sign in to PawsConnect')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('should call signInWithEmailAndPassword and navigate on successful sign in', async () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'password';
    signInWithEmailAndPassword.mockResolvedValueOnce({});

    const { getByPlaceholderText, getByText } = render(<SignIn />);

    fireEvent.changeText(getByPlaceholderText('Email'), mockEmail);
    fireEvent.changeText(getByPlaceholderText('Password'), mockPassword);
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, mockEmail, mockPassword);
      if (validEmails.includes(mockEmail)) {
        expect(router.push).toHaveBeenCalledWith({ pathname: '/shelterHome', params: { email: mockEmail } });
      } else {
        expect(router.push).toHaveBeenCalledWith({ pathname: '/home', params: { email: mockEmail } });
      }
    });
  });

  it('shows alert on sign in failure', async () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'password';
    signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/invalid-email' });

    const { getByPlaceholderText, getByText } = render(<SignIn />);

    fireEvent.changeText(getByPlaceholderText('Email'), mockEmail);
    fireEvent.changeText(getByPlaceholderText('Password'), mockPassword);
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Invalid email format", "Please enter a valid email address.");
    });
  });

  // Add more tests as needed for other scenarios
});
