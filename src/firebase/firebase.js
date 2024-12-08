// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyARb5rDWc_TLQaFYTD6aHVR0Sp04-g-vMs",
  authDomain: "ro-plant-tracking.firebaseapp.com",
  projectId: "ro-plant-tracking",
  storageBucket: "ro-plant-tracking.firebasestorage.app",
  messagingSenderId: "730692633466",
  appId: "1:730692633466:web:c5591d1f002ab542b88cc3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
