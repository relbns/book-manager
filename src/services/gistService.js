// src/services/gistService.js
import axios from 'axios';
import CryptoJS from 'crypto-js';

// Constants
const TOKEN_STORAGE_KEY = 'bkmgr_secure_auth';
const GIST_COLLECTIONS = ['books', 'loans', 'categories', 'authors', 'publishers', 'statistics'];
const GIST_FILE_PREFIX = 'db_bookManager_';

// Encrypt token before storing
const encryptToken = (token) => {
    const salt = window.location.hostname;
    return CryptoJS.AES.encrypt(token, salt).toString();
};

// Decrypt token from storage
const decryptToken = (encryptedToken) => {
    const salt = window.location.hostname;
    const bytes = CryptoJS.AES.decrypt(encryptedToken, salt);
    return bytes.toString(CryptoJS.enc.Utf8);
};

// Save token to localStorage (encrypted)
export const saveToken = (token) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, encryptToken(token));
};

// Get token from localStorage (decrypted)
export const getToken = () => {
    const encryptedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!encryptedToken) return null;
    return decryptToken(encryptedToken);
};

// Remove token from localStorage
export const removeToken = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!getToken();
};

// Create axios instance with authentication
const createAuthAxios = () => {
    const token = getToken();
    return axios.create({
        baseURL: 'https://api.github.com',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
};

// Get user's gists
export const getUserGists = async () => {
    const authAxios = createAuthAxios();
    try {
        const response = await authAxios.get('/gists');
        return response.data;
    } catch (error) {
        console.error('Error fetching gists:', error);
        throw error;
    }
};

// Find or create the app's gist
export const findOrCreateAppGist = async (description = 'Book Manager App Database') => {
    const authAxios = createAuthAxios();

    // First, try to find an existing gist
    try {
        const gists = await getUserGists();
        const appGist = gists.find(gist => gist.description === description);

        if (appGist) {
            return appGist.id;
        }

        // If no gist found, create a new one with empty collections
        const files = {};

        GIST_COLLECTIONS.forEach(collection => {
            files[`${GIST_FILE_PREFIX}${collection}.json`] = {
                content: JSON.stringify([])
            };
        });

        const response = await authAxios.post('/gists', {
            description,
            public: false,
            files
        });

        return response.data.id;
    } catch (error) {
        console.error('Error finding or creating app gist:', error);
        throw error;
    }
};

// Get a specific collection from the gist
export const getCollection = async (gistId, collectionName) => {
    const authAxios = createAuthAxios();

    try {
        const response = await authAxios.get(`/gists/${gistId}`);
        const fileName = `${GIST_FILE_PREFIX}${collectionName}.json`;

        if (response.data.files && response.data.files[fileName]) {
            const content = response.data.files[fileName].content;
            return JSON.parse(content);
        }

        return [];
    } catch (error) {
        console.error(`Error fetching ${collectionName} collection:`, error);
        throw error;
    }
};

// Update a specific collection in the gist
export const updateCollection = async (gistId, collectionName, data) => {
    const authAxios = createAuthAxios();
    const fileName = `${GIST_FILE_PREFIX}${collectionName}.json`;

    try {
        const files = {};
        files[fileName] = {
            content: JSON.stringify(data, null, 2)
        };

        await authAxios.patch(`/gists/${gistId}`, {
            files
        });

        return true;
    } catch (error) {
        console.error(`Error updating ${collectionName} collection:`, error);
        throw error;
    }
};

// Verify token validity by attempting to get user info
export const verifyToken = async (token) => {
    try {
        const response = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

export default {
    saveToken,
    getToken,
    removeToken,
    isAuthenticated,
    getUserGists,
    findOrCreateAppGist,
    getCollection,
    updateCollection,
    verifyToken
};