import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: "AIzaSyAlZQItUV9h7Dsr3J6adWKpU5ZsRafU8SU",
  authDomain: "posjorves.firebaseapp.com",
  databaseURL: "https://posjorves-default-rtdb.firebaseio.com",
  projectId: "posjorves",
  storageBucket: "posjorves.firebasestorage.app",
  messagingSenderId: "990837765102",
  appId: "1:990837765102:web:ae57c8ccafc64cfaafd4ff",
  measurementId: "G-GGVN9DK5RJ"
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
