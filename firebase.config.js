import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase } from 'firebase/database';
//import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCmsrUr5yDyVNyWHxPS-Ypbht2sOrpLSDg",
  authDomain: "pawsconnect-35602.firebaseapp.com",
  projectId: "pawsconnect-35602",
  storageBucket: "pawsconnect-35602.appspot.com",
  messagingSenderId: "889424592299",
  appId: "1:889424592299:web:1f57475e522c6f846a66ee",
  measurementId: "G-VL69L4X3ZZ",
  databaseURL: "https://pawsconnect-35602-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const database = getDatabase(app);

export { database };
export{ auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);
//const analytics = getAnalytics(app);