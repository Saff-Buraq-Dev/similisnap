// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCuEagtkkdTVkFt-09ORONtlMsrnrhKNi4",
    authDomain: "gharbidev.firebaseapp.com",
    projectId: "gharbidev",
    storageBucket: "gharbidev.appspot.com",
    messagingSenderId: "533136030031",
    appId: "1:533136030031:web:a46a12ee3f8b66cec5ed3a",
    measurementId: "G-306R1H98X5"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

export { auth };