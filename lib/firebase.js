// Firebase configuration for Playvo
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7dp-yQQAplwivObBb46gkrWCtrhxW8vk",
  authDomain: "playvo-304c1.firebaseapp.com",
  projectId: "playvo-304c1",
  storageBucket: "playvo-304c1.firebasestorage.app",
  messagingSenderId: "968027692251",
  appId: "1:968027692251:web:19a36a8253bccde9fa00fe",
  measurementId: "G-XXT0GMYNDT",
};

// Avoid reinitializing on hot-reload
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
