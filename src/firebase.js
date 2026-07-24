import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCzihTiCMM2JIc4z135RvWxLPwAd1lkIIo",
  authDomain: "kasir-8cc8f.firebaseapp.com",
  projectId: "kasir-8cc8f",
  storageBucket: "kasir-8cc8f.firebasestorage.app",
  messagingSenderId: "977282071469",
  appId: "1:977282071469:web:4d4700b30f3c88fa5bbf24",
  measurementId: "G-6PNY3KM5C4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

