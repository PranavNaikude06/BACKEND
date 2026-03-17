/**
 * notificationService.js
 * Only Firebase Push Notifications are active.
 * All email (Brevo, Gmail, Mailjet, Resend) and SMS (Twilio) providers removed.
 */

const { sendPushNotification } = require('./firebaseMessagingService');
const admin = require('firebase-admin');

const USERS = admin.firestore().collection('users');

/**
 * Sends a booking confirmation push notification via Firebase.
 * @param {string} phoneNumber - The patient's phone number (used to look up FCM token)
 * @param {string} email - Unused (kept for call-site compatibility)
 * @param {object} appointment - Appointment details
 */
const sendBookingConfirmation = async (phoneNumber, email, appointment) => {
    try {
        const userSnapshot = await USERS.where('phoneNumber', '==', phoneNumber).limit(1).get();
        if (userSnapshot.empty) return;

        const userData = userSnapshot.docs[0].data();
        if (!userData.fcmToken) return;

        await sendPushNotification(
            userData.fcmToken,
            {
                title: 'Booking Confirmed! ✅',
                body: `Your appointment at ${appointment.businessName} is set for ${appointment.time}. Queue #${appointment.queueNumber}.`
            },
            { type: 'booking_confirmation' }
        );
        console.log(`✅ [Push] Booking confirmation sent to ${phoneNumber}`);
    } catch (err) {
        console.error('⚠️ [Push] sendBookingConfirmation failed:', err.message);
    }
};

/**
 * Sends a queue position alert push notification via Firebase.
 * @param {string} email - Unused (kept for call-site compatibility)
 * @param {string} name - Patient name
 * @param {string} businessName - Clinic name
 * @param {number} position - Current queue position
 */
const sendQueueAlert = async (email, name, businessName, position) => {
    // Queue alerts require FCM token lookup by email — skipped since we use phone-based tokens.
    // Can be wired up if users store email + fcmToken in Firestore.
    console.log(`ℹ️ [Push] sendQueueAlert skipped for ${name} (position ${position}) — no email-to-token mapping.`);
};

module.exports = {
    sendBookingConfirmation,
    sendQueueAlert,
};
