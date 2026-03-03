const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

const initializeFirebase = () => {
    if (admin.apps.length === 0) {
        try {
            let privateKey = process.env.FIREBASE_PRIVATE_KEY;

            if (!privateKey) {
                console.error('❌ FIREBASE_PRIVATE_KEY is missing');
                return false;
            }

            // Diagnostic BEFORE processing (hex of first 10 chars)
            const rawPrefix = privateKey.substring(0, 10);
            console.log('Firebase Private Key raw diagnostic:');
            console.log('- Raw length:', privateKey.length);
            console.log('- Raw prefix (hex):', Buffer.from(rawPrefix).toString('hex'));

            // Aggressive processing
            // 1. Replace literal \n with real newlines first (handles both quoted and unquoted in different envs)
            privateKey = privateKey.replace(/\\n/g, '\n');

            // 2. Find the start of the PEM key (ignore anything before the header)
            const header = '-----BEGIN PRIVATE KEY-----';
            const footer = '-----END PRIVATE KEY-----';

            const startIdx = privateKey.indexOf(header);
            if (startIdx === -1) {
                console.error('❌ PEM Header not found in FIREBASE_PRIVATE_KEY');
                console.log('- Raw start (sanitized):', privateKey.substring(0, 30).replace(/[^a-zA-Z -]/g, '?'));
            } else {
                // Slice from the header start
                privateKey = privateKey.substring(startIdx);
                // Find the footer but ONLY after the header
                const finalFooterIdx = privateKey.indexOf(footer);
                if (finalFooterIdx !== -1) {
                    privateKey = privateKey.substring(0, finalFooterIdx + footer.length);
                }
            }

            // Final trim for safety
            privateKey = privateKey.trim();

            console.log('Firebase Private Key final diagnostic:');
            console.log('- Final length:', privateKey.length);
            console.log('- Starts with header:', privateKey.startsWith(header));
            console.log('- Ends with footer:', privateKey.endsWith(footer));

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
            return false;
        }
    }
    return true;
};

// Initialize immediately
const isInitialized = initializeFirebase();

// Always get a db instance to prevent boot crashes, even if init failed.
// Operations will fail late if init failed, but the server will stay alive to show logs.
const db = getFirestore();

module.exports = initializeFirebase;
module.exports.db = db;
