import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDhiL57hTvXvfbP7dy7_HzSwMJjVMvgtps",
  authDomain: "ipl-dashboard-a5124.firebaseapp.com",
  projectId: "ipl-dashboard-a5124",
  storageBucket: "ipl-dashboard-a5124.firebasestorage.app",
  messagingSenderId: "233810831301",
  appId: "1:233810831301:web:2f011c6fac86b9cc170dac",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
