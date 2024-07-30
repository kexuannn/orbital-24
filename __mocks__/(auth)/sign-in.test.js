// SignIn.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import SignIn from '../../app/(auth)/sign-in'; // Adjust the import based on your file structure
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  Link: ({ children, ...props }) => <a {...props}>{children}</a>
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn()
}));

jest.mock('../../firebase.config', () => ({
  auth: {}
}));

jest.mock('../../components/allowedShelters', () => (['allowed@example.com']));

jest.mock('../../components/FormField', () => {
  const React = require('react');
  const { View, Text, TextInput, TouchableOpacity, Image } = require('react-native');
  return ({ title, value, handleChangeText, otherStyles, keyboardType }) => (
    <View style={{ marginVertical: 10 }}>
      <Text>{title}</Text>
      <TextInput
        value={value}
        onChangeText={(text) => handleChangeText(text)}
        placeholder={`Enter ${title}`}
        keyboardType={keyboardType}
        secureTextEntry={title === 'Password'}
      />
    </View>
  );
});

jest.mock('../../components/EmailButton', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return ({ title, handlePress, containerStyles, isLoading }) => (
    <TouchableOpacity onPress={handlePress} disabled={isLoading}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

describe('SignIn', () => {
  it('renders the Sign In page correctly', () => {
    render(<SignIn />);

    // Check for email input
    const emailInput = screen.getByPlaceholderText(/enter email/i);
    expect(emailInput).toBeInTheDocument();

    // Check for password input
    const passwordInput = screen.getByPlaceholderText(/enter password/i);
    expect(passwordInput).toBeInTheDocument();

    // Check for sign in button
    const signInButton = screen.getByText(/sign in/i);
    expect(signInButton).toBeInTheDocument();

    // Check for sign up link
    const signUpLink = screen.getByText(/sign up now/i);
    expect(signUpLink).toBeInTheDocument();
  });

  it('submits the form correctly', async () => {
    signInWithEmailAndPassword.mockResolvedValueOnce({});

    render(<SignIn />);

    const emailInput = screen.getByPlaceholderText(/enter email/i);
    const passwordInput = screen.getByPlaceholderText(/enter password/i);
    const signInButton = screen.getByText(/sign in/i);

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith({}, 'test@example.com', 'password123');
  });
});
