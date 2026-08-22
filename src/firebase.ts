// src/firebase.ts
// Conexão do app com o seu projeto Firebase.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCJ01P7A5aQhf-speq1lMZr0G3Po6YjDJU",
  authDomain: "imobiflow-saas.firebaseapp.com",
  projectId: "imobiflow-saas",
  storageBucket: "imobiflow-saas.firebasestorage.app",
  messagingSenderId: "648047481923",
  appId: "1:648047481923:web:0c48c9ec16c12cdcf670f6",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
