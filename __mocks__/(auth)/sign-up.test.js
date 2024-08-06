import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUp from '../../app/(auth)/sign-up';
import { auth } from '../../firebase.config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import validEmails from '../../components/allowedShelters';

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}));

describe('SignUp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Sign Up page correctly', () => {
    const { getByText, getByPlaceholderText } = render(<SignUp />);

    expect(getByText('Sign up as a User:')).toBeTruthy();
    expect(getByText('Are you a shelter?')).toBeTruthy();
    expect(getByText('Sign up here instead!')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign up')).toBeTruthy();
  });

  test('shows error message for email already in use', async () => {
    createUserWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/email-already-in-use' });

    const { getByPlaceholderText, getByText } = render(<SignUp />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign up'));

    await waitFor(() => {
      expect(getByText('Email already exists. Try another email.')).toBeTruthy();
    });
  });

  test('shows error message for invalid email format', async () => {
    createUserWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/invalid-email' });

    const { getByPlaceholderText, getByText } = render(<SignUp />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'invalid-email');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign up'));

    await waitFor(() => {
      expect(getByText('Invalid email format. Please enter a valid email address.')).toBeTruthy();
    });
  });

  test('shows error message for weak password', async () => {
    createUserWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/weak-password' });

    const { getByPlaceholderText, getByText } = render(<SignUp />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), '123');
    fireEvent.press(getByText('Sign up'));

    await waitFor(() => {
      expect(getByText('Invalid password. Password needs to be longer than 6 characters.')).toBeTruthy();
    });
  });

  test('shows error message for shelter email signing up as user', async () => {
    createUserWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: '123', email: 'shelter@example.com' },
    });
    validEmails.includes = jest.fn().mockReturnValue(true);

    const { getByPlaceholderText, getByText } = render(<SignUp />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'shelter@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign up'));

    await waitFor(() => {
      expect(getByText('Verified shelter email! Please sign up as a shelter instead.')).toBeTruthy();
    });
  });

  test('shows error message for invalid shelter email', async () => {
    createUserWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: '123', email: 'user@example.com' },
    });
    validEmails.includes = jest.fn().mockReturnValue(false);

    const { getByPlaceholderText, getByText } = render(<SignUp />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign up'));

    await waitFor(() => {
      expect(getByText('Sign Up Error. Please try again.')).toBeTruthy();
    });
  });
});
