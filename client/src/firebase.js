import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Debug function to check environment variables
const checkEnvVars = () => {
  const requiredVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing environment variables:', missingVars);
    console.log('Current environment variables:', process.env);
  }
  
  return missingVars.length === 0;
};

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBoLuv0ETgzAChoajVjTHp4xWovZzmv2Fs",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "gamedb-f4b9c.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "gamedb-f4b9c",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "gamedb-f4b9c.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:dummy123"
};

// Check environment variables
const hasValidConfig = checkEnvVars();

// Initialize Firebase with error handling
let app;
try {
  if (hasValidConfig) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase config missing or incomplete. Using defaults.');
    app = initializeApp(firebaseConfig);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Create a dummy app to prevent crashes
  try {
    app = initializeApp({
      apiKey: "dummy",
      authDomain: "dummy.firebaseapp.com",
      projectId: "dummy"
    });
  } catch (dummyError) {
    console.error('Failed to create dummy Firebase app:', dummyError);
  }
}

// Initialize services with error handling
let auth, db;
try {
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('Firebase services initialized');
} catch (error) {
  console.error('Firebase services initialization error:', error);
}

export { auth, db };
export default app;