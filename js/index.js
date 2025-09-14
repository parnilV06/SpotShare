import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithCustomToken, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, orderBy, where, doc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Set log level for debugging
setLogLevel('debug');

// --- FIREBASE INITIALIZATION ---
// Placeholder for your Firebase project details
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
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
const postsContainer = document.getElementById('posts-container');
const myPostsContainer = document.getElementById('my-posts-container');
const googleAuthBtn = document.getElementById('google-auth-btn');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileId = document.getElementById('profile-id');
const profilePicture = document.getElementById('profile-picture');
const loadingOverlay = document.getElementById('loading-overlay');
const foodFilterBtn = document.getElementById('food-filter');
const placesFilterBtn = document.getElementById('places-filter');
const allFilterBtn = document.getElementById('all-filter');
const searchInput = document.getElementById('search-input');
const filterBtn = document.getElementById('filter-btn');
const filterModal = document.getElementById('filter-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const likesInput = document.getElementById('likes-input');
const applyFiltersBtn = document.getElementById('apply-filters-btn');
const clearFiltersBtn = document.getElementById('clear-filters-btn');
const tagsContainer = document.getElementById('tags-container');

// --- STATE AND DATA ---
let currentUser = null;
let isAuthReady = false;
let currentFilter = 'all';
let currentSearchQuery = '';
let currentSelectedTags = [];
let minLikes = 0;

// All possible tags for the filter modal
const foodTags = ["Chaat", "Chinese", "Cafe", "Snacks", "Street Food", "Healthy", "Desserts", "Beverages"];
const placeTags = ["Gardens", "Nature", "Aesthetic", "Temples", "Hangout Spots", "Historical", "Adventure"];
const allTags = [...new Set([...foodTags, ...placeTags])];

// --- UTILITY FUNCTIONS ---
function renderPost(post, container) {
    const postCard = document.createElement('div');
    postCard.classList.add('post-card', 'bg-gray-800', 'rounded-3xl', 'overflow-hidden', 'relative', 'shadow-md');

    // Generate the HTML for the horizontal image gallery
    const imageUrls = post.imageUrls && Array.isArray(post.imageUrls) ? post.imageUrls : [];
    const imageGalleryHtml = imageUrls.length > 0 ?
        imageUrls.map(url => `
            <img src="${url}" alt="${post.title}" class="w-full h-full object-cover flex-shrink-0">
        `).join('') :
        `<img src="https://placehold.co/600x400/292524/A16207?text=No+Image" alt="No image available" class="w-full h-full object-cover">`;

    postCard.innerHTML = `
        <div class="relative w-full h-64 overflow-hidden">
            <div class="flex h-full w-full overflow-x-auto snap-x snap-mandatory">
                ${imageGalleryHtml}
            </div>
            <div class="absolute top-2 right-2 p-2 bg-gray-900 bg-opacity-75 rounded-full text-white text-sm font-bold flex items-center">
                <i class="fas fa-star text-yellow-400 mr-1"></i>
                <span>${post.rating || 0}</span>
            </div>
        </div>
        <div class="p-4 relative">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="text-xl font-bold text-white">${post.title}</h3>
                    <p class="text-sm text-gray-400">${post.description}</p>
                </div>
            </div>
            <div class="flex justify-between items-center text-gray-400 text-sm mt-4">
                <div class="flex items-center space-x-1">
                    <i class="fas fa-map-marker-alt text-sm"></i>
                    <span>${post.location}</span>
                </div>
                <div class="flex items-center space-x-4">
                    <button class="like-btn flex items-center space-x-1 text-orange-400" data-post-id="${post.id}" data-likes="${post.likes}">
                        <i class="fas fa-heart text-lg"></i>
                        <span class="text-sm">${post.likes || 0}</span>
                    </button>
                    <i class="fas fa-flag text-lg"></i>
                </div>
            </div>
        </div>
        <!-- Comments Section -->
        <div class="p-4 border-t border-gray-700">
            <h4 class="font-semibold text-gray-300 mb-2">Comments</h4>
            <div id="comments-container-${post.id}" class="text-xs space-y-2 mb-4">
                <!-- Comments will be dynamically loaded here -->
            </div>
            <form class="comment-form flex space-x-2" data-post-id="${post.id}">
                <input type="text" placeholder="Add a comment..." class="flex-grow p-2 rounded-full bg-gray-700 text-white text-sm focus:outline-none">
                <button type="submit" class="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
                    <i class="fas fa-paper-plane text-xs"></i>
                </button>
            </form>
        </div>
    `;
    container.appendChild(postCard);

    // Add event listener for the like button
    const likeBtn = postCard.querySelector('.like-btn');
    if (likeBtn) {
        likeBtn.addEventListener('click', async (e) => {
            const postId = e.currentTarget.dataset.postId;
            const currentLikes = parseInt(e.currentTarget.dataset.likes, 10);
            const postRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId);
            await updateDoc(postRef, {
                likes: currentLikes + 1
            });
        });
    }

    const commentForm = postCard.querySelector('.comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = e.target.querySelector('input');
            const commentText = input.value.trim();
            if (commentText && currentUser) {
                await addComment(commentForm.dataset.postId, commentText);
                input.value = '';
            } else if (!currentUser) {
                console.warn('Sign in required to comment.');
            }
        });
    }

    setupCommentsListener(post.id);
}

// Comments functions
async function addComment(postId, text) {
    if (!currentUser) return;
    const comment = {
        text,
        userName: currentUser.displayName || 'Anonymous',
        userPhotoURL: currentUser.photoURL || `https://placehold.co/40x40/orange/white?text=C`,
        timestamp: new Date()
    };
    const commentsCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts', postId, 'comments');
    await addDoc(commentsCollectionRef, comment);
}

function setupCommentsListener(postId) {
    const commentsContainer = document.getElementById(`comments-container-${postId}`);
    if (!commentsContainer) return;
    const commentsQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'posts', postId, 'comments'), orderBy('timestamp', 'asc'));
    onSnapshot(commentsQuery, (snapshot) => {
        commentsContainer.innerHTML = '';
        snapshot.forEach((doc) => {
            const comment = doc.data();
            const commentElement = document.createElement('div');
            commentElement.classList.add('flex', 'space-x-2', 'items-start');
            commentElement.innerHTML = `
                <img src="${comment.userPhotoURL}" alt="${comment.userName}" class="w-6 h-6 rounded-full">
                <p class="text-gray-300"><span class="font-bold text-orange-400 mr-1">${comment.userName}:</span>${comment.text}</p>
            `;
            commentsContainer.appendChild(commentElement);
        });
    });
}

// --- MAIN LOGIC AND EVENT LISTENERS ---

// Auth State Listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        if (profileName) profileName.textContent = currentUser.displayName || 'Anonymous User';
        if (profileEmail) profileEmail.textContent = currentUser.email || '';
        if (profileId) profileId.textContent = `User ID: ${currentUser.uid}`;
        if (profilePicture) profilePicture.src = currentUser.photoURL || `https://placehold.co/120x120/orange/white?text=${currentUser.displayName ? currentUser.displayName[0] : 'A'}`;
        if (googleAuthBtn) googleAuthBtn.textContent = 'Sign Out';
        if (googleAuthBtn) googleAuthBtn.onclick = () => auth.signOut();
    } else {
        currentUser = null;
        if (profileName) profileName.textContent = 'Guest User';
        if (profileEmail) profileEmail.textContent = '';
        if (profileId) profileId.textContent = 'Sign in to post.';
        if (profilePicture) profilePicture.src = `https://placehold.co/120x120/orange/white?text=S`;
        if (googleAuthBtn) googleAuthBtn.textContent = 'Sign in with Google';
        if (googleAuthBtn) googleAuthBtn.onclick = handleGoogleSignIn;
    }
    isAuthReady = true;
    setupRealtimeListeners();
});

// Google Sign-In
const handleGoogleSignIn = async () => {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Google sign-in error:", error);
    }
};

// Custom Auth Token Sign-In (for Canvas environment)
if (typeof __initial_auth_token !== 'undefined') {
    signInWithCustomToken(auth, __initial_auth_token).catch((error) => {
        console.error("Custom token sign-in failed:", error);
    });
}

// Real-time listener for posts
function setupRealtimeListeners() {
    if (!isAuthReady) return;
    if (!postsContainer) {
        console.log("postsContainer not found, skipping listener setup.");
        return;
    }

    let postsQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'posts'), orderBy('timestamp', 'desc'));

    // Apply category filter
    if (currentFilter !== 'all') {
        postsQuery = query(postsQuery, where('category', '==', currentFilter));
    }
    
    // Use onSnapshot to get all posts and then filter in memory
    onSnapshot(postsQuery, (snapshot) => {
        const allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const filteredPosts = allPosts.filter(post => {
            const matchesSearch = !currentSearchQuery ||
                (post.title && post.title.toLowerCase().includes(currentSearchQuery)) ||
                (post.description && post.description.toLowerCase().includes(currentSearchQuery)) ||
                (post.location && post.location.toLowerCase().includes(currentSearchQuery)) ||
                (post.tags && post.tags.some(tag => tag.toLowerCase().includes(currentSearchQuery)));
            
            const matchesTags = currentSelectedTags.length === 0 ||
                (post.tags && currentSelectedTags.every(tag => post.tags.includes(tag)));
            
            const matchesLikes = post.likes >= minLikes;

            return matchesSearch && matchesTags && matchesLikes;
        });

        postsContainer.innerHTML = '';
        if (myPostsContainer) myPostsContainer.innerHTML = '';
        const myUserId = currentUser ? currentUser.uid : null;
        filteredPosts.forEach(post => {
            renderPost(post, postsContainer);
            if (myUserId && post.userId === myUserId && myPostsContainer) {
                renderPost(post, myPostsContainer);
            }
        });
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    });
}

// --- FILTER BUTTONS LOGIC ---
const filterButtons = [foodFilterBtn, placesFilterBtn, allFilterBtn];

function updateFilterStyles(activeButtonId) {
    if (!filterButtons[0]) return;
    filterButtons.forEach(btn => {
        if (btn.id === activeButtonId) {
            btn.classList.add('bg-orange-500', 'text-white');
            btn.classList.remove('bg-gray-800', 'text-gray-400');
        } else {
            btn.classList.add('bg-gray-800', 'text-gray-400');
            btn.classList.remove('bg-orange-500', 'text-white');
        }
    });
}

foodFilterBtn.addEventListener('click', () => {
    currentFilter = 'food';
    setupRealtimeListeners();
    updateFilterStyles('food-filter');
});

placesFilterBtn.addEventListener('click', () => {
    currentFilter = 'place';
    setupRealtimeListeners();
    updateFilterStyles('places-filter');
});

allFilterBtn.addEventListener('click', () => {
    currentFilter = 'all';
    setupRealtimeListeners();
    updateFilterStyles('all-filter');
});

// --- SEARCH & FILTER MODAL LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    // Check if the elements exist before adding listeners
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value.toLowerCase();
            setupRealtimeListeners();
        });
    }

    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            filterModal.classList.remove('hidden');
            renderTagsForFilter();
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            filterModal.classList.add('hidden');
        });
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            minLikes = parseInt(likesInput.value, 10) || 0;
            filterModal.classList.add('hidden');
            setupRealtimeListeners();
        });
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            likesInput.value = '';
            currentSelectedTags = [];
            minLikes = 0;
            if (tagsContainer) {
                tagsContainer.querySelectorAll('.tag-filter-btn').forEach(btn => {
                    btn.classList.remove('bg-orange-500', 'text-white');
                    btn.classList.add('bg-gray-800', 'text-gray-400');
                });
            }
            filterModal.classList.add('hidden');
            setupRealtimeListeners();
        });
    }

    function renderTagsForFilter() {
        if (!tagsContainer) return;
        tagsContainer.innerHTML = '';
        const tagsToRender = currentFilter === 'food' ? foodTags : currentFilter === 'place' ? placeTags : allTags;
        tagsToRender.forEach(tag => {
            const button = document.createElement('button');
            button.textContent = tag;
            button.classList.add('tag-filter-btn', 'px-4', 'py-2', 'rounded-full', 'bg-gray-800', 'text-gray-400', 'font-medium', 'focus:outline-none');
            if (currentSelectedTags.includes(tag)) {
                button.classList.add('bg-orange-500', 'text-white');
                button.classList.remove('bg-gray-800', 'text-gray-400');
            }
            button.addEventListener('click', () => {
                if (currentSelectedTags.includes(tag)) {
                    currentSelectedTags = currentSelectedTags.filter(t => t !== tag);
                    button.classList.remove('bg-orange-500', 'text-white');
                    button.classList.add('bg-gray-800', 'text-gray-400');
                } else {
                    currentSelectedTags.push(tag);
                    button.classList.add('bg-orange-500', 'text-white');
                    button.classList.remove('bg-gray-800', 'text-gray-400');
                }
            });
            tagsContainer.appendChild(button);
        });
    }
});

// --- NAVIGATION ---
document.getElementById('nav-home').addEventListener('click', () => {
    document.getElementById('homepage').classList.remove('hidden');
    document.getElementById('profile-page').classList.add('hidden');
});

document.getElementById('nav-add').addEventListener('click', () => {
    window.location.href = 'add_post.html';
});

document.getElementById('nav-profile').addEventListener('click', () => {
    document.getElementById('homepage').classList.add('hidden');
    document.getElementById('profile-page').classList.remove('hidden');
});

// Initial logic for homepage
window.addEventListener('DOMContentLoaded', () => {
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
    if (allFilterBtn) updateFilterStyles('all-filter');
});
