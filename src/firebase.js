// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// (Optional) analytics
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD5eh44kGlgYy6_YKbmkDBB1TuW9qfVbKU",
  authDomain: "webdyd-56ba6.firebaseapp.com",
  projectId: "webdyd-56ba6",
  storageBucket: "webdyd-56ba6.firebasestorage.app",
  messagingSenderId: "437345510124",
  appId: "1:437345510124:web:441ce85aeda21010393bc9",
  measurementId: "G-0JMMB3M7RJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ FIX: Initialize Auth
export const auth = getAuth(app);

// (Optional)
const analytics = getAnalytics(app);