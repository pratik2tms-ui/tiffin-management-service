const { initializeApp, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const path = require('path');
const env = process.env.NODE_ENV || 'development';
const config = require('./config.json')[env];

let isInitialized = false;
let messaging = null;

try {
    // Try to load from environment variables first
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        // Handle newline characters in the private key from .env
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
        
        const app = initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey
            })
        });
        messaging = getMessaging(app);
        isInitialized = true;
        console.log('✅ Firebase Admin SDK initialized successfully from environment variables');
    } else {
        // Fallback to service account path in config.json
        const serviceAccountPath = config.FIREBASE_SERVICE_ACCOUNT_PATH 
            ? path.resolve(process.cwd(), config.FIREBASE_SERVICE_ACCOUNT_PATH)
            : null;

        if (serviceAccountPath) {
            const serviceAccount = require(serviceAccountPath);

            const app = initializeApp({
                credential: cert(serviceAccount)
            });
            messaging = getMessaging(app);
            isInitialized = true;
            console.log('✅ Firebase Admin SDK initialized successfully from file path');
        } else {
            console.warn('⚠️ Firebase credentials not found in .env or config.json. Firebase features will be disabled.');
        }
    }
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    // Don't throw so the server can still start if Firebase isn't configured correctly yet
}

module.exports = {
    messaging,
    isInitialized
};
