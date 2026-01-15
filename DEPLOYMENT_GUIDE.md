# TicTacThree Deployment Guide - 100% FREE Setup

This guide covers deploying your app with **ZERO COST** - no paid services required!

---

## What You Get (All FREE!)

✅ **Firestore Database** - Free tier: 50K reads, 20K writes/day
✅ **Firebase Hosting** - Free tier: 10GB storage, 360MB/day bandwidth
✅ **Firebase Auth** - Free tier: Unlimited users
✅ **Cloudinary Image Hosting** - Free tier: 25GB storage, 25GB bandwidth/month
✅ **No Cloud Functions** - We use unsigned uploads (free!)

---

## Prerequisites

1. **Firebase Project** - Create at https://console.firebase.google.com/
2. **Cloudinary Account** - Create at https://cloudinary.com/ (free tier)
3. **Firebase CLI** - Install globally:
   ```bash
   npm install -g firebase-tools
   ```

---

## Step 1: Configure Cloudinary (5 minutes)

### 1.1 Create Unsigned Upload Preset

This is the KEY to making uploads free and secure!

1. Go to https://cloudinary.com/console/settings/upload
2. Click **"Add upload preset"**
3. Configure:
   - **Preset name:** `ml_default`
   - **Signing mode:** **Unsigned** ⭐ (This makes it free!)
   - **Folder:** `custom-avatars`
   - **Use filename:** Enable
   - **Unique filename:** Enable
4. Click **"Upload manipulations"**:
   - **Max file size:** 2 MB
   - **Allowed formats:** jpg, png, webp
   - **Max image width:** 500 px (optional, saves space)
   - **Max image height:** 500 px (optional)
5. Click **"Save"**

### 1.2 Verify Your Settings

In `src/components/AdminAvatarManager.jsx`, verify these match your Cloudinary account:

```javascript
const CLOUDINARY_CLOUD_NAME = 'dijsoag1f'; // ← Replace with YOUR cloud name
const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // ← Must match preset name above
```

You can find your cloud name at https://cloudinary.com/console

---

## Step 2: Deploy Firestore Security Rules

### 2.1 Review Rules

Check `firestore.rules` - key points:
- Users can read/write their own data
- Users CANNOT set `isAdmin` flag on themselves
- Only admins can create/update/delete custom avatars
- Anyone can read custom avatars (to display in shop)

### 2.2 Deploy Rules

```bash
firebase login
firebase use --add  # Select your project
firebase deploy --only firestore:rules
```

### 2.3 Verify Deployment

Go to Firebase Console > Firestore Database > Rules tab to verify.

---

## Step 3: Set Up Admin User

### 3.1 Create Your First Admin

1. Open your app (locally or hosted)
2. Sign up with a new user account
3. Go to Firebase Console > Firestore Database
4. Navigate to `users` collection
5. Find your user document (by UID)
6. Click "Add field":
   - **Field name:** `isAdmin`
   - **Type:** boolean
   - **Value:** `true`
7. Click "Update"

### 3.2 Verify Admin Access

1. Refresh your app
2. Go to Settings
3. You should see **"🔧 Admin Panel"** button
4. Click it to access avatar upload interface

---

## Step 4: Deploy Your App

### 4.1 Build Production Bundle

```bash
npm run build
```

### 4.2 Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Your app will be live at: `https://YOUR_PROJECT_ID.web.app`

---

## Step 5: Test Avatar Upload

### 5.1 Upload Test Image

1. Log in as admin user
2. Go to Settings > Admin Panel
3. Fill out form:
   - Name: "Test Avatar"
   - Description: "Testing upload"
   - Price: 100
   - Border Color: (pick any color)
   - Image: (select a JPG/PNG < 2MB)
4. Click "Add Avatar"
5. Wait for "Avatar added successfully!"

### 5.2 Verify Upload

1. Check Cloudinary console > Media Library
2. You should see your image in `custom-avatars` folder
3. Go to Shop in your app
4. Scroll to "Custom Uploaded" section
5. Your new avatar should appear!

### 5.3 Test Purchase & Equip

1. Log out of admin account
2. Create a new regular user
3. Go to Shop
4. Purchase your custom avatar
5. Equip it
6. Verify it shows in top bar
7. Refresh page - should still be equipped

---

## Troubleshooting

### Upload Fails: "Invalid signature"

**Cause:** Upload preset is not set to "Unsigned"

**Fix:**
1. Go to Cloudinary > Settings > Upload
2. Edit your `ml_default` preset
3. Change "Signing mode" to **"Unsigned"**
4. Save

### Upload Fails: "Permission denied"

**Cause:** User is not marked as admin in Firestore

**Fix:**
1. Firebase Console > Firestore > `users` collection
2. Find user document
3. Add/verify field: `isAdmin: true`

### Images Don't Display

**Cause:** Cloudinary cloud name doesn't match

**Fix:**
1. Check your cloud name at https://cloudinary.com/console
2. Update `CLOUDINARY_CLOUD_NAME` in `src/components/AdminAvatarManager.jsx`
3. Rebuild: `npm run build`
4. Redeploy: `firebase deploy --only hosting`

### Firestore Rules Block Writes

**Cause:** Rules not deployed or incorrect

**Fix:**
```bash
firebase deploy --only firestore:rules
```

Then verify in Firebase Console > Firestore > Rules

---

## Security Features

✅ **No API Secrets Exposed** - We use unsigned uploads
✅ **Admin-Only Uploads** - Firestore rules enforce this
✅ **Size Limits** - Cloudinary preset restricts to 2MB
✅ **Format Validation** - Only images allowed
✅ **Frontend Validation** - Additional client-side checks
✅ **Cannot Self-Promote to Admin** - Firestore rules prevent this

---

## Cost Breakdown (All FREE!)

### Firebase Spark Plan (Free Forever)

| Service | Free Tier | Your Usage (Estimated) |
|---------|-----------|------------------------|
| Firestore Reads | 50K/day | ~1K/day (well under) |
| Firestore Writes | 20K/day | ~100/day (well under) |
| Hosting Storage | 10 GB | ~500 MB |
| Hosting Bandwidth | 360 MB/day | ~50 MB/day |
| Authentication | Unlimited | ∞ |

### Cloudinary Free Tier

| Resource | Free Tier | Your Usage (Estimated) |
|----------|-----------|------------------------|
| Storage | 25 GB | ~1 GB (50 avatars) |
| Bandwidth | 25 GB/month | ~5 GB/month |
| Transformations | 25K/month | ~1K/month |
| Credits | 25/month | ~10/month |

**Total Monthly Cost: $0.00** 💰

---

## Performance Optimization Tips

### 1. Image Optimization

In Cloudinary preset, add transformations:
- **Quality:** Auto
- **Format:** Auto (serves WebP when supported)
- **Max dimensions:** 500x500 px

### 2. Caching

Firebase Hosting automatically caches static assets.

### 3. Firestore Indexes

No custom indexes needed for this app!

### 4. CDN

Both Firebase Hosting and Cloudinary use global CDNs automatically.

---

## Monitoring & Limits

### Check Firebase Usage

Go to: Firebase Console > Usage and billing

Watch for:
- Firestore read/write counts
- Hosting bandwidth
- If approaching limits, upgrade to Blaze (pay-as-you-go)

### Check Cloudinary Usage

Go to: https://cloudinary.com/console/usage

Watch for:
- Storage used
- Bandwidth used
- Transformations
- If approaching limits, delete unused images or upgrade

---

## Scaling Up (If Needed)

### When to Upgrade Firebase (Blaze Plan)

Upgrade if you exceed free tier:
- 50K+ Firestore reads/day
- 20K+ Firestore writes/day
- 360 MB+ hosting bandwidth/day

**Cost:** $0.06 per 100K document reads, $0.18 per 100K writes

### When to Upgrade Cloudinary

Upgrade if you exceed:
- 25 GB storage
- 25 GB bandwidth/month

**Cost:** $99/month for Plus plan (75 GB storage, 150 GB bandwidth)

---

## Backup Strategy (Recommended)

### Backup Firestore Data

```bash
# Install gcloud CLI
# Then export data
gcloud firestore export gs://YOUR_BUCKET/backups/$(date +%Y%m%d)
```

### Backup Cloudinary Images

Cloudinary has built-in backups, but you can also:
1. Use Cloudinary API to list all images
2. Download them periodically
3. Store in GitHub repo or external storage

---

## Next Steps

1. ✅ Set up custom domain (Firebase Hosting supports this free!)
2. ✅ Add more admin users (repeat Step 3)
3. ✅ Configure email/password auth settings
4. ✅ Set up analytics (Google Analytics is free)
5. ✅ Add more cosmetic items!

---

## Support

- **Firebase Docs:** https://firebase.google.com/docs
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Issues:** https://github.com/v7s7/TicTacThree/issues

---

**Last Updated:** 2026-01-15
**Cost:** $0/month
**Setup Time:** ~15 minutes
**Maintenance:** ~0 hours/month

Enjoy your completely free, production-ready avatar system! 🚀
