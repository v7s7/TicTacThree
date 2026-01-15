# TicTacThree Deployment & Setup Guide

This guide covers deploying Firebase Functions, configuring Cloudinary, and setting up Firestore security rules.

---

## Prerequisites

1. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project** created at https://console.firebase.google.com/

3. **Cloudinary Account** created at https://cloudinary.com/

---

## Step 1: Firebase Functions Setup

### 1.1 Install Functions Dependencies

```bash
cd functions
npm install
cd ..
```

### 1.2 Login to Firebase

```bash
firebase login
```

### 1.3 Initialize Firebase Project (if not already done)

```bash
firebase use --add
# Select your Firebase project from the list
```

---

## Step 2: Configure Cloudinary Credentials

### 2.1 Get Your Cloudinary Credentials

1. Go to https://cloudinary.com/console
2. Copy your:
   - Cloud Name (e.g., "dijsoag1f")
   - API Key (e.g., "414896274751932")
   - API Secret (⚠️ KEEP THIS SECRET!)

### 2.2 Set Firebase Functions Environment Variables

Run these commands, replacing with your actual values:

```bash
firebase functions:config:set cloudinary.cloud_name="dijsoag1f"
firebase functions:config:set cloudinary.api_key="414896274751932"
firebase functions:config:set cloudinary.api_secret="YOUR_ACTUAL_SECRET_HERE"
```

### 2.3 Verify Configuration

```bash
firebase functions:config:get
```

You should see:
```json
{
  "cloudinary": {
    "cloud_name": "dijsoag1f",
    "api_key": "414896274751932",
    "api_secret": "***hidden***"
  }
}
```

---

## Step 3: Deploy Firebase Functions

### 3.1 Deploy Functions Only

```bash
firebase deploy --only functions
```

This will deploy:
- `cloudinarySign` - Generates secure upload signatures
- `deleteCustomAvatar` - Securely deletes custom avatars

### 3.2 Verify Deployment

Check Firebase Console > Functions to see both functions deployed.

---

## Step 4: Deploy Firestore Security Rules

### 4.1 Review Rules

Check `firestore.rules` to understand the security model:
- Users can read/write their own data (but cannot set `isAdmin`)
- Only admins can create/update/delete custom avatars
- Game rooms are protected by participant IDs

### 4.2 Deploy Rules

```bash
firebase deploy --only firestore:rules
```

### 4.3 Verify Rules

Go to Firebase Console > Firestore Database > Rules to verify deployment.

---

## Step 5: Set Up Admin User

### 5.1 Create First Admin User

1. Sign up a user in your app
2. Go to Firebase Console > Firestore Database
3. Find the user's document in the `users` collection
4. Add field `isAdmin` (boolean) = `true`

### 5.2 Verify Admin Access

1. Log in with the admin user
2. Go to Settings in the app
3. You should see "Admin Panel" button
4. Click it to access the avatar upload interface

---

## Step 6: Local Development Setup (Optional)

### 6.1 Download Functions Config for Local Testing

```bash
firebase functions:config:get > functions/.runtimeconfig.json
```

⚠️ **IMPORTANT:** `.runtimeconfig.json` is in `.gitignore` - never commit it!

### 6.2 Start Firebase Emulators

```bash
firebase emulators:start
```

This starts local emulators for:
- Functions (http://localhost:5001)
- Firestore (http://localhost:8080)
- Auth (http://localhost:9099)

### 6.3 Update App to Use Emulators (Development Only)

In `src/firebase.js`, add after `initializeApp()`:

```javascript
if (process.env.NODE_ENV === 'development') {
  const { connectFunctionsEmulator } = require('firebase/functions');
  const { connectFirestoreEmulator } = require('firebase/firestore');
  const { connectAuthEmulator } = require('firebase/auth');

  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

---

## Step 7: Deploy Frontend

### 7.1 Build React App

```bash
npm run build
```

### 7.2 Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

### 7.3 Access Your App

Your app will be live at: `https://YOUR_PROJECT_ID.web.app`

---

## Step 8: Verify Everything Works

### 8.1 Test Avatar Upload

1. Log in as admin user
2. Go to Settings > Admin Panel
3. Upload a test image
4. Verify it appears in Cloudinary dashboard
5. Verify it appears in shop

### 8.2 Test Security

1. Open browser DevTools > Network tab
2. Upload an avatar
3. Verify NO API secrets are visible in:
   - Network requests
   - JavaScript source code
   - Response payloads

### 8.3 Test Firestore Rules

1. Try to create a custom avatar without admin flag (should fail)
2. Try to set `isAdmin: true` on your own user document (should fail)
3. Verify only admins can see/use admin features

---

## Troubleshooting

### Functions Not Deploying

**Error:** `Missing required environment variables`

**Solution:** Make sure you set all Cloudinary config:
```bash
firebase functions:config:get
```

### Upload Fails with "permission-denied"

**Cause:** User is not marked as admin in Firestore

**Solution:** Add `isAdmin: true` to user document in Firestore

### Cloudinary Upload Fails

**Error:** `Invalid signature`

**Cause:** Timestamp or signature generation issue

**Solution:**
1. Check Cloud Function logs: `firebase functions:log`
2. Verify Cloudinary API secret is correct
3. Ensure timestamp is within 1 hour of current time

### Firestore Rules Blocking Writes

**Error:** `permission-denied` when writing to Firestore

**Solution:**
1. Check Firebase Console > Firestore > Rules
2. Verify rules were deployed correctly
3. Test rules in Firebase Console > Firestore > Rules > Simulator

---

## Security Checklist

✅ **NEVER** commit `.env`, `.runtimeconfig.json`, or any files with secrets
✅ **NEVER** hardcode API secrets in frontend code
✅ **ALWAYS** use Cloud Functions for sensitive operations
✅ **ALWAYS** validate admin status in Cloud Functions, not just client
✅ **ALWAYS** use Firestore security rules to prevent unauthorized access
✅ **REVIEW** Cloud Function logs regularly for suspicious activity

---

## Monitoring & Maintenance

### View Function Logs

```bash
firebase functions:log --only cloudinarySign
firebase functions:log --only deleteCustomAvatar
```

### Monitor Cloudinary Usage

Go to https://cloudinary.com/console/usage to track:
- Storage used
- Bandwidth used
- Transformations performed

### Monitor Firestore Usage

Go to Firebase Console > Firestore Database > Usage to track:
- Reads/writes
- Storage
- Network egress

---

## Cost Optimization

### Firebase Functions

- **Spark Plan (Free):** 125K invocations/month, 40K GB-seconds/month
- **Blaze Plan (Pay-as-you-go):** $0.40 per million invocations

### Cloudinary

- **Free Tier:** 25 credits/month (≈25K images or 25GB storage)
- **Upgrade:** As needed for more storage/bandwidth

### Firestore

- **Spark Plan (Free):** 50K reads, 20K writes, 1GB storage per day
- **Blaze Plan (Pay-as-you-go):** $0.06 per 100K reads

---

## Next Steps

1. ✅ Set up monitoring alerts in Firebase Console
2. ✅ Configure custom domain in Firebase Hosting
3. ✅ Set up backup strategy for Firestore data
4. ✅ Implement rate limiting on Cloud Functions (if needed)
5. ✅ Add analytics to track avatar usage

---

**Last Updated:** 2026-01-15
**Maintained by:** TicTacThree Development Team
