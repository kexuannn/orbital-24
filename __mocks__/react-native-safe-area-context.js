// __mocks__/react-native-safe-area-context.js
import React from 'react';
import { View } from 'react-native';

export const SafeAreaView = View;
export const SafeAreaProvider = ({ children }) => <>{children}</>;
export const useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });
