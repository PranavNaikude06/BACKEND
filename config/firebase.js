const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

const initializeFirebase = () => {
    if (admin.apps.length === 0) {
        try {
            let privateKey = process.env.FIREBASE_PRIVATE_KEY;

            if (!privateKey) {
                throw new Error('FIREBASE_PRIVATE_KEY is missing');
            }

            // Remove any surrounding quotes (sometimes happens in Render/env vars)
            privateKey = privateKey.trim();
            if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
                privateKey = privateKey.substring(1, privateKey.length - 1);
            } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
                privateKey = privateKey.substring(1, privateKey.length - 1);
            }

            // Replace literal \n with actual newlines
            privateKey = privateKey.replace(/\\n/g, '\n');

            // Final trim to handle any spaces after newline conversion
            privateKey = privateKey.trim();

            console.log('Firebase Private Key Diagnostic:');
            console.log('- Length:', privateKey.length);
            console.log('- Starts with Header:', privateKey.startsWith('-----BEGIN PRIVATE KEY-----'));
            console.log('- Ends with Footer:', privateKey.includes('-----END PRIVATE KEY-----'));

            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
            });
            console.log('✅ Firebase Admin Initialized');
            return true;
        } catch (error) {
            console.error('❌ Firebase Admin Initialization Error:', error.message);
            // Don't exit here, but the app will likely fail on first DB call
            return false;
        }
    }
    return true;
};

// Initialize immediately
const isInitialized = initializeFirebase();

// Only get db if initialized successfully
const db = isInitialized ? getFirestore() : null;

module.exports = initializeFirebase;
module.exports.db = db;
