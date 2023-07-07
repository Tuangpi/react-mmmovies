import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: "mmmovies-1df57.firebaseapp.com",
  projectId: "mmmovies-1df57",
  storageBucket: "mmmovies-1df57.appspot.com",
  messagingSenderId: "158441658815",
  appId: "1:158441658815:web:1334488403d67c1002e90a",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();
export const storage = getStorage(app);
