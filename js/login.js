import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// --- FIREBASE CONFIG PLACEHOLDER ---
const firebaseConfig = {
    apiKey: "AIzaSyDs4sa2rBhh1GkNyjaKP-pV107XUQNM-4s",
    authDomain: "spotshare-11582.firebaseapp.com",
    projectId: "spotshare-11582",
    storageBucket: "spotshare-11582.appspot.com",
    messagingSenderId: "799981561520",
    appId: "1:799981561520:web:247d414f62cd26e2877d75",
    measurementId: "G-2292PBZTF7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleSignInBtn = document.getElementById('google-sign-in-btn');

const handleGoogleSignIn = async () => {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Google sign-in error:", error);
    }
};

if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', handleGoogleSignIn);
}

// Redirect to homepage after successful sign-in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Redirect to the homepage after a successful login
        window.location.href = 'index.html';
    }
});
