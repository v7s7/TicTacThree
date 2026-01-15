const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();

/**
 * Cloud Function to generate a signed upload signature for Cloudinary
 * SECURITY: Only accessible to authenticated admin users
 *
 * POST /cloudinary/sign
 * Request body: {
 *   timestamp: number,
 *   folder: string (optional),
 *   public_id: string (optional)
 * }
 *
 * Response: {
 *   signature: string,
 *   timestamp: number,
 *   apiKey: string,
 *   cloudName: string
 * }
 */
exports.cloudinarySign = functions.https.onCall(async (data, context) => {
  // SECURITY: Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to upload images'
    );
  }

  const uid = context.auth.uid;

  // SECURITY: Verify user is admin
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();

    if (!userDoc.exists || !userDoc.data().isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admin users can upload images'
      );
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to verify admin status'
    );
  }

  // Get Cloudinary config from environment variables
  const cloudinaryApiSecret = functions.config().cloudinary?.api_secret;
  const cloudinaryApiKey = functions.config().cloudinary?.api_key;
  const cloudinaryCloudName = functions.config().cloudinary?.cloud_name;

  if (!cloudinaryApiSecret || !cloudinaryApiKey || !cloudinaryCloudName) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Cloudinary configuration not found. Please set environment variables.'
    );
  }

  const timestamp = data.timestamp || Math.floor(Date.now() / 1000);
  const folder = data.folder || 'custom-avatars';

  // Build parameters to sign
  const paramsToSign = {
    timestamp: timestamp,
    folder: folder
  };

  // Add optional parameters if provided
  if (data.public_id) {
    paramsToSign.public_id = data.public_id;
  }

  // Generate signature
  // Cloudinary signature format: sorted params as "key=value&key=value" + API secret
  const signatureString = Object.keys(paramsToSign)
    .sort()
    .map(key => `${key}=${paramsToSign[key]}`)
    .join('&');

  const signature = crypto
    .createHash('sha1')
    .update(signatureString + cloudinaryApiSecret)
    .digest('hex');

  console.log('[Cloudinary Sign] Generated signature for user:', uid);

  // Return signature and public config
  return {
    signature: signature,
    timestamp: timestamp,
    apiKey: cloudinaryApiKey,
    cloudName: cloudinaryCloudName,
    folder: folder
  };
});

/**
 * Cloud Function to validate and delete custom avatars (admin only)
 * This ensures only admins can delete custom avatars
 */
exports.deleteCustomAvatar = functions.https.onCall(async (data, context) => {
  // SECURITY: Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const uid = context.auth.uid;

  // SECURITY: Verify user is admin
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();

    if (!userDoc.exists || !userDoc.data().isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admin users can delete custom avatars'
      );
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to verify admin status'
    );
  }

  const { avatarId } = data;

  if (!avatarId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Avatar ID is required'
    );
  }

  try {
    // Delete from Firestore
    await admin.firestore().collection('customAvatars').doc(avatarId).delete();

    console.log('[Delete Avatar] Admin user', uid, 'deleted avatar:', avatarId);

    return { success: true, avatarId };
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to delete avatar: ' + error.message
    );
  }
});
