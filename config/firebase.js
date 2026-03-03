const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

const initializeFirebase = () => {
    if (admin.apps.length === 0) {
        try {
            let privateKey = process.env.FIREBASE_PRIVATE_KEY;
            if (privateKey && privateKey.startsWith('"') && privateKey.endsWith('"')) {
                privateKey = privateKey.substring(1, privateKey.length - 1);
            }
            if (privateKey) {
                privateKey = privateKey.replace(/\\n/g, '\n');
            }

            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
            });
            console.log('✅ Firebase Admin Initialized');
        } catch (error) {
            console.error('❌ Firebase Admin Initialization Error:', error.message);
        }
    }
};

// Initialize immediately so db is ready
initializeFirebase();

const db = getFirestore();

module.exports = initializeFirebase;
module.exports.db = db;
