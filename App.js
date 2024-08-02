import { registerRootComponent } from 'expo';
import { ExpoRouter } from 'expo-router';
// At the top of your entry file (e.g., `index.js` or `App.js`)
require('dotenv').config();

// Register the ExpoRouter as the root component
registerRootComponent(ExpoRouter);
