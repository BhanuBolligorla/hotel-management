import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyBzXWvuyd1XAMtZmR8A94NFCbdrif446-U",
  authDomain: "restaurant-app-28bde.firebaseapp.com",
  projectId: "restaurant-app-28bde",
  storageBucket: "restaurant-app-28bde.firebasestorage.app",
  messagingSenderId: "178363450093",
  appId: "1:178363450093:web:0cb4cb5b64b95c554d02e4",
  measurementId: "G-6XP11LFTEB"
};


const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);


export const storage = getStorage(app);

export default app;