// import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
// import { getAuth, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
// import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
// import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// // Set log level for debugging
// setLogLevel('debug');

// // --- FIREBASE INITIALIZATION ---
// // Placeholder for your Firebase project details
// const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
// // const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
// const firebaseConfig = {
//   apiKey: "AIzaSyDs4sa2rBhh1GkNyjaKP-pV107XUQNM-4s",
//   authDomain: "spotshare-11582.firebaseapp.com",
//   projectId: "spotshare-11582",
//   storageBucket: "spotshare-11582.appspot.com",
//   messagingSenderId: "799981561520",
//   appId: "1:799981561520:web:247d414f62cd26e2877d75",
//   measurementId: "G-2292PBZTF7"
// };
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app);

// // --- DOM ELEMENTS ---
// const addPostForm = document.getElementById('add-post-form');
// const foodBtn = document.getElementById('food-btn');
// const placeBtn = document.getElementById('place-btn');
// const tagsContainer = document.getElementById('tags-container');
// const imageUpload = document.getElementById('image-upload');
// const imagePreview = document.getElementById('image-preview');
// const loadingOverlay = document.getElementById('loading-overlay');
// const descriptionTextarea = document.getElementById('post-description');
// const charCounter = document.getElementById('char-counter');

// // --- STATE AND DATA ---
// const foodTags = ['Chaat', 'Chinese', 'Cafe', 'Snacks', 'Sweets', 'Beverages', 'Bakery'];
// const placeTags = ['Garden', 'Aesthetic', 'Temple', 'Hangout', 'Nature', 'Historical'];
// let selectedCategory = 'food';
// let currentUser = null;

// // --- UTILITY FUNCTIONS ---
// function renderTags(tags) {
//     tagsContainer.innerHTML = '';
//     tags.forEach(tag => {
//         const button = document.createElement('button');
//         button.type = 'button';
//         button.textContent = tag;
//         button.classList.add('tag-button');
//         button.addEventListener('click', () => {
//             button.classList.toggle('active');
//         });
//         tagsContainer.appendChild(button);
//     });
// }

// // --- MAIN LOGIC AND EVENT LISTENERS ---

// // Auth State Listener to get current user
// onAuthStateChanged(auth, (user) => {
//     currentUser = user;
//     if (!currentUser) {
//         console.warn('User not signed in. Cannot post.');
//     }
// });

// // Custom Auth Token Sign-In (for Canvas environment)
// if (typeof __initial_auth_token !== 'undefined') {
//     signInWithCustomToken(auth, __initial_auth_token).catch((error) => {
//         console.error("Custom token sign-in failed:", error);
//     });
// }

// // Handle "Add Post" form submission
// addPostForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     if (!currentUser) {
//         alert('Please sign in to submit a post.');
//         return;
//     }

//     loadingOverlay.classList.remove('hidden');

//     const name = document.getElementById('post-name').value;
//     const location = document.getElementById('post-location').value;
//     const description = document.getElementById('post-description').value;
//     const tags = Array.from(tagsContainer.querySelectorAll('.tag-button.active')).map(btn => btn.textContent);
//     const files = imageUpload.files;
    
//     const imageUrls = [];
//     if (files.length > 0) {
//         try {
//             for (const file of files) {
//                 const fileRef = ref(storage, `${appId}/posts/${currentUser.uid}/${file.name}-${Date.now()}`);
//                 await uploadBytes(fileRef, file);
//                 const downloadURL = await getDownloadURL(fileRef);
//                 imageUrls.push(downloadURL);
//             }
//         } catch (error) {
//             console.error("Image upload failed:", error);
//             loadingOverlay.classList.add('hidden');
//             alert('Image upload failed. Please try again.');
//             return;
//         }
//     }

//     try {
//         const newPost = {
//             title: name,
//             location: location,
//             description: description,
//             category: selectedCategory,
//             tags: tags,
//             imageUrls: imageUrls,
//             likes: 0,
//             userId: currentUser.uid,
//             userName: currentUser.displayName,
//             userPhotoURL: currentUser.photoURL,
//             timestamp: serverTimestamp()
//         };

//         await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'posts'), newPost);

//         // Reset form and return to homepage
//         addPostForm.reset();
//         tagsContainer.innerHTML = '';
//         renderTags(foodTags);
//         imagePreview.innerHTML = '';
//         window.location.href = 'index.html'; // Redirect to the homepage

//     } catch (error) {
//         console.error("Error adding document: ", error);
//         alert("An error occurred while saving your post. Please try again.");
//     } finally {
//         loadingOverlay.classList.add('hidden');
//     }
// });

// // Event listeners for Add Post page
// foodBtn.addEventListener('click', () => {
//     selectedCategory = 'food';
//     foodBtn.classList.add('bg-orange-500', 'text-white');
//     foodBtn.classList.remove('bg-gray-800', 'text-gray-400');
//     placeBtn.classList.remove('bg-orange-500', 'text-white');
//     placeBtn.classList.add('bg-gray-800', 'text-gray-400');
//     renderTags(foodTags);
// });

// placeBtn.addEventListener('click', () => {
//     selectedCategory = 'place';
//     placeBtn.classList.add('bg-orange-500', 'text-white');
//     placeBtn.classList.remove('bg-gray-800', 'text-gray-400');
//     foodBtn.classList.remove('bg-orange-500', 'text-white');
//     foodBtn.classList.add('bg-gray-800', 'text-gray-400');
//     renderTags(placeTags);
// });

// descriptionTextarea.addEventListener('input', () => {
//     const wordCount = descriptionTextarea.value.split(/\s+/).filter(word => word.length > 0).length;
//     charCounter.textContent = `${wordCount} / 35 words (approx)`;
// });

// imageUpload.addEventListener('change', (event) => {
//     const files = event.target.files;
//     if (files.length > 10) {
//         alert('You can only upload a maximum of 10 images.');
//         imageUpload.value = '';
//         return;
//     }

//     imagePreview.innerHTML = '';
//     Array.from(files).forEach(file => {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//             const img = document.createElement('img');
//             img.src = e.target.result;
//             img.classList.add('w-full', 'h-24', 'object-cover', 'rounded-lg', 'border', 'border-gray-700');
//             imagePreview.appendChild(img);
//         };
//         reader.readAsDataURL(file);
//     });
// });

// // Initial render
// renderTags(foodTags);

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Set log level for debugging
setLogLevel('debug');

// --- FIREBASE INITIALIZATION ---
// Placeholder for your Firebase project details
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
// const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
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
const db = getFirestore(app);

// --- DOM ELEMENTS ---
const addPostForm = document.getElementById('add-post-form');
const foodBtn = document.getElementById('food-btn');
const placeBtn = document.getElementById('place-btn');
const tagsContainer = document.getElementById('tags-container');
const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const loadingOverlay = document.getElementById('loading-overlay');
const descriptionTextarea = document.getElementById('post-description');
const charCounter = document.getElementById('char-counter');

// --- STATE AND DATA ---
const foodTags = ['Chaat', 'Chinese', 'Cafe', 'Snacks', 'Sweets', 'Beverages', 'Bakery'];
const placeTags = ['Garden', 'Aesthetic', 'Temple', 'Hangout', 'Nature', 'Historical'];
let selectedCategory = 'food';
let currentUser = null;

// --- UTILITY FUNCTIONS ---
function renderTags(tags) {
    tagsContainer.innerHTML = '';
    tags.forEach(tag => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = tag;
        button.classList.add('tag-button');
        button.addEventListener('click', () => {
            button.classList.toggle('active');
        });
        tagsContainer.appendChild(button);
    });
}

async function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// --- MAIN LOGIC AND EVENT LISTENERS ---

// Auth State Listener to get current user
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (!currentUser) {
        console.warn('User not signed in. Cannot post.');
    }
});

// Custom Auth Token Sign-In (for Canvas environment)
if (typeof __initial_auth_token !== 'undefined') {
    signInWithCustomToken(auth, __initial_auth_token).catch((error) => {
        console.error("Custom token sign-in failed:", error);
    });
}

// Handle "Add Post" form submission
addPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) {
        alert('Please sign in to submit a post.');
        return;
    }

    loadingOverlay.classList.remove('hidden');

    const name = document.getElementById('post-name').value;
    const location = document.getElementById('post-location').value;
    const description = document.getElementById('post-description').value;
    const tags = Array.from(tagsContainer.querySelectorAll('.tag-button.active')).map(btn => btn.textContent);
    const files = imageUpload.files;
    
    const base64Images = [];
    if (files.length > 0) {
        try {
            for (const file of files) {
                const base64 = await convertFileToBase64(file);
                base64Images.push(base64);
            }
        } catch (error) {
            console.error("Image conversion failed:", error);
            loadingOverlay.classList.add('hidden');
            alert('Image conversion failed. Please try again.');
            return;
        }
    }

    try {
        const newPost = {
            title: name,
            location: location,
            description: description,
            category: selectedCategory,
            tags: tags,
            imageUrls: base64Images, // Store Base64 strings directly
            likes: 0,
            userId: currentUser.uid,
            userName: currentUser.displayName,
            userPhotoURL: currentUser.photoURL,
            timestamp: serverTimestamp()
        };

        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'posts'), newPost);

        // Reset form and redirect to homepage
        addPostForm.reset();
        tagsContainer.innerHTML = '';
        renderTags(foodTags);
        imagePreview.innerHTML = '';
        window.location.href = 'index.html';

    } catch (error) {
        console.error("Error adding document: ", error);
        alert("An error occurred while saving your post. Please try again.");
    } finally {
        loadingOverlay.classList.add('hidden');
    }
});

// Event listeners for Add Post page
foodBtn.addEventListener('click', () => {
    selectedCategory = 'food';
    foodBtn.classList.add('bg-orange-500', 'text-white');
    foodBtn.classList.remove('bg-gray-800', 'text-gray-400');
    placeBtn.classList.remove('bg-orange-500', 'text-white');
    placeBtn.classList.add('bg-gray-800', 'text-gray-400');
    renderTags(foodTags);
});

placeBtn.addEventListener('click', () => {
    selectedCategory = 'place';
    placeBtn.classList.add('bg-orange-500', 'text-white');
    placeBtn.classList.remove('bg-gray-800', 'text-gray-400');
    foodBtn.classList.remove('bg-orange-500', 'text-white');
    foodBtn.classList.add('bg-gray-800', 'text-gray-400');
    renderTags(placeTags);
});

descriptionTextarea.addEventListener('input', () => {
    const wordCount = descriptionTextarea.value.split(/\s+/).filter(word => word.length > 0).length;
    charCounter.textContent = `${wordCount} / 35 words (approx)`;
});

imageUpload.addEventListener('change', (event) => {
    const files = event.target.files;
    if (files.length > 10) {
        alert('You can only upload a maximum of 10 images.');
        imageUpload.value = '';
        return;
    }

    imagePreview.innerHTML = '';
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('w-full', 'h-24', 'object-cover', 'rounded-lg', 'border', 'border-gray-700');
            imagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});

// Initial render
renderTags(foodTags);
