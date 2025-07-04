// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4KygG5Sada_qgeeeOLQDweCKhkl1YUbY",
  authDomain: "brothersbrockerage.firebaseapp.com",
  projectId: "brothersbrockerage",
  storageBucket: "brothersbrockerage.firebasestorage.app",
  messagingSenderId: "222814568730",
  appId: "1:222814568730:web:4d780dbdf167f458d8eca3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app; 