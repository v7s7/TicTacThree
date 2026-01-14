# Custom Avatar Upload System - Admin Guide

## Overview
The avatar system has been simplified to 3 basic avatars, with the ability for admins to upload custom avatars with images.

## Simplified Avatar System

### Default Avatars (3 only)
1. **Basic Frame** - Purple border, free
2. **Clean Frame** - Light gray border, free  
3. **Minimal Frame** - Gray border, free

All animated, elemental, and mythic avatars have been removed.

## Admin Upload System

### How It Works

#### For Admins:
1. Open the Admin Avatar Manager component
2. Fill out the upload form:
   - **Avatar Name** (required) - e.g., "Cool Dragon"
   - **Description** - Describe the avatar
   - **Price** (required) - Set price in coins (can be 0 for free)
   - **Border Color** - Pick a color for the avatar border
   - **Image File** (required) - Upload PNG/JPG, max 2MB

3. Click "Add Avatar"
4. Image is uploaded to Firebase Storage
5. Avatar data is saved to Firestore
6. Avatar immediately appears in shop for all users

#### For Users:
- Custom avatars appear in the shop under "Custom Uploaded" tier
- Users can purchase with coins (price set by admin)
- After purchase, users can equip the avatar
- The uploaded image is displayed as the avatar

### Admin Functions

#### Add Custom Avatar
```javascript
import { addCustomAvatar } from '../utils/shopManager';

const avatar = await addCustomAvatar({
  name: 'Dragon Frame',
  description: 'Epic dragon design',
  price: 500,
  color: '#ff4500',
  imageUrl: 'https://...' // From Firebase Storage
}, db);
```

#### Update Custom Avatar
```javascript
import { updateCustomAvatar } from '../utils/shopManager';

await updateCustomAvatar('custom_1234567890', {
  name: 'Updated Name',
  price: 300,
  description: 'New description'
}, db);
```

#### Delete Custom Avatar
```javascript
import { deleteCustomAvatar } from '../utils/shopManager';

await deleteCustomAvatar('custom_1234567890', db);
```

#### Load All Custom Avatars
```javascript
import { fetchCustomAvatars } from '../utils/shopManager';

const avatars = await fetchCustomAvatars(db);
```

## Technical Details

### Firestore Structure

**Collection:** `customAvatars`

**Document Fields:**
```javascript
{
  id: 'custom_1234567890',
  name: 'Dragon Frame',
  description: 'Epic dragon design',
  price: 500,
  color: '#ff4500',
  imageUrl: 'https://firebasestorage.googleapis.com/...',
  type: 'frame',
  tier: 'custom',
  custom: true,
  createdAt: 1234567890,
  updatedAt: 1234567890 // Optional
}
```

### Firebase Storage

**Path:** `custom-avatars/{timestamp}_{filename}`

**Example:** `custom-avatars/1705234567890_dragon.png`

### Image Requirements

- **Format:** PNG, JPG, JPEG, GIF
- **Max Size:** 2MB
- **Recommended:** Square images (1:1 ratio)
- **Optimal Size:** 256x256px or 512x512px

### Security

- Only admin users should have access to AdminAvatarManager component
- Check user role/permissions before showing admin panel
- Firebase Storage rules should restrict uploads to admin users only

**Recommended Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /custom-avatars/{allPaths=**} {
      // Only admins can upload
      allow write: if request.auth != null && 
                      get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      // Anyone can read
      allow read: if true;
    }
  }
}
```

**Recommended Firestore Rules:**
```javascript
match /customAvatars/{avatarId} {
  // Only admins can create/update/delete
  allow write: if request.auth != null && 
                  get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true;
  // Anyone can read
  allow read: if true;
}
```

## Integration Example

### In App.js

```javascript
import { useEffect } from 'react';
import { fetchCustomAvatars, loadCustomAvatars } from './utils/shopManager';
import AdminAvatarManager from './components/AdminAvatarManager';

function App() {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const isAdmin = user?.isAdmin || false; // Check if user is admin

  // Load custom avatars on app start
  useEffect(() => {
    const loadAvatars = async () => {
      try {
        const avatars = await fetchCustomAvatars(db);
        loadCustomAvatars(avatars);
      } catch (error) {
        console.error('Failed to load custom avatars:', error);
      }
    };
    loadAvatars();
  }, []);

  return (
    <div>
      {/* Show admin button only for admins */}
      {isAdmin && (
        <button onClick={() => setShowAdminPanel(true)}>
          Admin Panel
        </button>
      )}
      
      {/* Admin panel modal */}
      {showAdminPanel && (
        <AdminAvatarManager 
          user={user}
          onClose={() => setShowAdminPanel(false)}
        />
      )}
      
      {/* Rest of app */}
    </div>
  );
}
```

## Features

### ✅ Completed
- Simplified to 3 basic avatars
- Admin can upload custom avatar images
- Admin sets price for each avatar
- Admin sets border color
- Custom avatars appear in shop
- Users can buy and equip custom avatars
- Full CRUD operations for custom avatars
- Firebase Storage integration
- Image validation (type, size)
- Real-time updates

### 🚀 Future Enhancements
- Batch upload multiple avatars
- Avatar categories/tags
- Preview before upload
- Image cropping/editing
- Analytics on popular avatars
- Seasonal/limited-time avatars
- Avatar ratings/favorites

## Troubleshooting

### Image Not Uploading
- Check file size (must be under 2MB)
- Check file type (PNG/JPG only)
- Check Firebase Storage permissions
- Check network connection

### Avatar Not Appearing in Shop
- Verify avatar was saved to Firestore
- Check `fetchCustomAvatars()` is called on app load
- Refresh the page
- Check browser console for errors

### Users Can't Purchase
- Verify user has enough coins
- Check Firestore permissions
- Verify avatar price is set correctly
- Check inventory system is working

## Support

For issues or questions about the custom avatar system, check:
1. Browser console for errors
2. Firebase console for data
3. Network tab for upload failures
4. Firestore rules for permission issues
