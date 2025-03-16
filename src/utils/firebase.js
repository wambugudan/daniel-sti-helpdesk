// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// My Custom import
import {getFirestore} from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDD6SVG5GppqiCNJLFMI3hYSCKxlujzlhM",
  authDomain: "acts-sti-helpdesk.firebaseapp.com",
  projectId: "acts-sti-helpdesk",
  storageBucket: "acts-sti-helpdesk.firebasestorage.app",
  messagingSenderId: "116753081570",
  appId: "1:116753081570:web:f3755d0283f8f0151e2abb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

export {db}