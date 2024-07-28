import React from 'react';
import { render, fireEvent, waitFor } from 'react-test-renderer'
import SignIn from '../app/(auth)/sign-in'; // Adjust the import path
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Alert } from 'react-native';
import { router } from 'expo-router';

jest.mock('firebase/auth');
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
    },
}));
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }) => children,
}));
jest.mock('../components/FormField', () => 'FormField');
jest.mock('../components/EmailButton', () => 'EmailButton');
jest.mock('../constants', () => ({
    images: {
        logo: 'logo-path',
    },
}));
jest.mock('../firebase.config', () => ({
    auth: {},
}));
jest.mock('../components/allowedShelters', () => ['allowed@shelter.com']);

describe('SignIn Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByText, getByPlaceholderText } = render(<SignIn />);

        expect(getByText('Sign in to PawsConnect')).toBeTruthy();
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByText("Don't have an account?")).toBeTruthy();
    });

    it('handles successful sign in', async () => {
        signInWithEmailAndPassword.mockResolvedValueOnce({ user: { email: 'test@example.com' } });

        const { getByPlaceholderText, getByText } = render(<SignIn />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password');
        fireEvent.press(getByText('Sign In'));

        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password');
            expect(router.push).toHaveBeenCalledWith({ pathname: '/home', params: { email: 'test@example.com' } });
        });
    });

    it('handles invalid email error', async () => {
        signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/invalid-email' });

        const { getByPlaceholderText, getByText } = render(<SignIn />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'invalid-email');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password');
        fireEvent.press(getByText('Sign In'));

        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'invalid-email', 'password');
            expect(Alert.alert).toHaveBeenCalledWith("Invalid email format", "Please enter a valid email address.");
        });
    });

    // Add more tests to handle other error cases and edge cases
});
