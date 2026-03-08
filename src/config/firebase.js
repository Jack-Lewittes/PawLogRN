import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Replace every value below with your own Firebase project config.
// Get these from: Firebase Console → Project Settings → Your apps → SDK setup
const firebaseConfig = {
  apiKey: "AIzaSyBk64aLwgzejlxvZgX7r4MJuru6tgIiAyM",
  authDomain: "pawlog-198f1.firebaseapp.com",
  projectId: "pawlog-198f1",
  storageBucket: "pawlog-198f1.firebasestorage.app",
  messagingSenderId: "388402863277",
  appId: "1:388402863277:web:a317ee908a74cd175cfa24"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
