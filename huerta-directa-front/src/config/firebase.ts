import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCjlirRzJ6WOi026TocVOiDQmUVmHGw2Kk",
    authDomain: "huerta-directa-f3c99.firebaseapp.com",
    projectId: "huerta-directa-f3c99",
    storageBucket: "huerta-directa-f3c99.firebasestorage.app",
    messagingSenderId: "438012103288",
    appId: "1:438012103288:web:9b96cba76c2ab79bd97b8d"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = "es";