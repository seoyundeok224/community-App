// firebase.js
/* eslint-disable import/no-unresolved */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDVZrlNziWVyL7uKzFZD9sQNl5aTy07hZk",
  authDomain: "communityapp-c741a.firebaseapp.com",
  projectId: "communityapp-c741a",
  storageBucket: "communityapp-c741a.firebasestorage.app",
  messagingSenderId: "1078580877964",
  appId: "1:1078580877964:web:abb71b8a2699620be179a9",
  measurementId: "G-Y9CDMG4LG3"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// React Native에서 Auth 상태를 AsyncStorage에 영속화
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
