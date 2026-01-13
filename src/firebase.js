import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAcW7Ql_Ey8FhUH4QeoSQzsRdgZmAO_3BQ",
  authDomain: "tictacthree-e1b92.firebaseapp.com",
  projectId: "tictacthree-e1b92",
  storageBucket: "tictacthree-e1b92.firebasestorage.app",
  messagingSenderId: "406750021509",
  appId: "1:406750021509:web:70dee2d1d87ed267bc26ec",
  measurementId: "G-VE6QVBB9GW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
