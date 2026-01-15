# Avatar System Fix - Test Checklist

This checklist verifies that all avatar/background bugs are fixed and the system works correctly.

---

## PHASE 1: Avatar Equip Logic Tests

### Test 1.1: Basic Equip Flow
- [ ] Log in as a user
- [ ] Go to Shop > Collection
- [ ] Equip `frame_basic` (should work)
- [ ] Verify "✓ Equipped" button shows for `frame_basic`
- [ ] Verify avatar displays correctly in top bar
- [ ] Equip `bg_none` background (should work)
- [ ] Verify both frame and background persist

### Test 1.2: Inventory Validation
- [ ] Try to equip an item NOT in your inventory (should fail)
  - Open browser console
  - Run: `handleAvatarUpdate({ frame: 'frame_clean', background: 'bg_none' })`
  - Expected: Alert "You do not own this avatar frame!"
- [ ] Verify state did NOT change
- [ ] Verify Firestore did NOT update

### Test 1.3: Item Existence Validation
- [ ] Manually set equipped frame to invalid ID in Firestore
  - Go to Firebase Console > Firestore
  - Edit user document: `equippedFrame: "invalid_frame_123"`
- [ ] Refresh the page
- [ ] Expected: Frame should auto-reset to `frame_basic`
- [ ] Check console: Should see `[Avatar Cleanup]` warning
- [ ] Verify Firestore was updated to `frame_basic`

### Test 1.4: Multiple Item Switching
- [ ] Purchase `bg_purple` (50 coins)
- [ ] Equip `bg_purple` - should work instantly
- [ ] Verify background changes in UI
- [ ] Equip `bg_green` (if owned) - should work instantly
- [ ] Switch back to `bg_purple` - should work
- [ ] Verify no lag or state confusion

### Test 1.5: Persistence Across Sessions
- [ ] Equip a specific frame (e.g., `frame_clean`)
- [ ] Equip a specific background (e.g., `bg_purple`)
- [ ] Log out
- [ ] Log back in
- [ ] Expected: Same frame and background are equipped
- [ ] Verify in Shop that correct items show "✓ Equipped"

---

## PHASE 2: Custom Avatar Tests

### Test 2.1: Admin Upload (FREE Unsigned Flow)
- [ ] Log in as admin user
- [ ] Go to Settings > Admin Panel
- [ ] Select an image file (< 2MB, .jpg/.png)
- [ ] Fill in:
  - Name: "Test Avatar"
  - Description: "Test upload"
  - Price: 100
  - Color: #ff5733
- [ ] Click "Add Avatar"
- [ ] **CRITICAL:** Open DevTools > Network tab
- [ ] Verify NO API secrets visible in requests
- [ ] Verify request goes directly to Cloudinary (not Cloud Function)
- [ ] Verify request uses `upload_preset` parameter
- [ ] Expected: Avatar uploads successfully
- [ ] Verify avatar appears in shop under "Custom Uploaded"

### Test 2.2: Non-Admin Upload Blocked
- [ ] Log in as NON-admin user
- [ ] Verify "Admin Panel" button is NOT visible in Settings
- [ ] Try to manually create custom avatar in Firestore (if rules allow console access)
- [ ] Expected: Firestore rules block the write
- [ ] Note: Unsigned uploads can't be blocked client-side, but admin UI is hidden
- [ ] Firestore rules ensure only admins can save avatar metadata to DB

### Test 2.3: Custom Avatar Equip
- [ ] As regular user, go to Shop
- [ ] Find a custom avatar
- [ ] Purchase it (if not owned)
- [ ] Equip the custom avatar
- [ ] Verify it displays correctly
- [ ] Refresh page
- [ ] Verify custom avatar still equipped

### Test 2.4: Deleted Avatar Cleanup
- [ ] As admin, delete a custom avatar
- [ ] As user with that avatar equipped, refresh page
- [ ] Expected: Avatar should auto-reset to `frame_basic`
- [ ] Check console: Should see cleanup warning

---

## PHASE 3: Unequip Functionality Tests

### Test 3.1: Unequip Frame
- [ ] Equip `frame_clean` (any non-default frame)
- [ ] Verify "Unequip" button appears below "✓ Equipped"
- [ ] Click "Unequip"
- [ ] Expected: Frame reverts to `frame_basic`
- [ ] Verify `frame_basic` now shows "✓ Equipped"

### Test 3.2: Unequip Background
- [ ] Equip `bg_purple` (any non-default background)
- [ ] Verify "Unequip" button appears
- [ ] Click "Unequip"
- [ ] Expected: Background reverts to `bg_none`

### Test 3.3: Cannot Unequip Defaults
- [ ] Equip `frame_basic`
- [ ] Expected: NO "Unequip" button (only "✓ Equipped")
- [ ] Equip `bg_none`
- [ ] Expected: NO "Unequip" button

---

## PHASE 4: Security Tests

### Test 4.1: Firestore Rules - User Data
- [ ] Open Firestore Rules Simulator (Firebase Console)
- [ ] Test: Non-admin tries to set `isAdmin: true`
  ```
  Collection: users
  Document: {userId}
  Operation: update
  Auth: Authenticated as non-admin user
  Data: { isAdmin: true }
  Expected: DENIED
  ```

### Test 4.2: Firestore Rules - Custom Avatars
- [ ] Test: Non-admin tries to create custom avatar
  ```
  Collection: customAvatars
  Document: custom_123
  Operation: create
  Auth: Authenticated as non-admin user
  Data: { name: "Hacked Avatar" }
  Expected: DENIED
  ```

### Test 4.3: Firestore Rules - Admin Can Write
- [ ] Test: Admin creates custom avatar
  ```
  Collection: customAvatars
  Document: custom_123
  Operation: create
  Auth: Authenticated as ADMIN user
  Data: { name: "Admin Avatar" }
  Expected: ALLOWED
  ```

### Test 4.4: Cloudinary Unsigned Upload Security
- [ ] Open DevTools > Network tab
- [ ] Upload a custom avatar as admin
- [ ] Check the request to Cloudinary
- [ ] Verify: ONLY `upload_preset`, `folder`, and `file` are sent
- [ ] Verify: NO `api_secret` or `signature` in request
- [ ] Expected: Upload succeeds with public preset only

### Test 4.5: Source Code Security Audit
- [ ] Search entire codebase for:
  - [ ] `CLOUDINARY_API_SECRET` (should NOT exist anywhere)
  - [ ] Hardcoded API secrets (should find NONE)
  - [ ] Only `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET` should exist (public values)
- [ ] Build production bundle: `npm run build`
- [ ] Search build/static/js/*.js for:
  - [ ] `api_secret` (should NOT appear)
  - [ ] Only cloud name and preset name (both public, safe)

---

## PHASE 5: Edge Cases & Error Handling

### Test 5.1: Offline Equip Attempt
- [ ] Go offline (DevTools > Network > Offline)
- [ ] Try to equip an avatar
- [ ] Expected: Operation fails gracefully
- [ ] Go online
- [ ] Verify state is consistent

### Test 5.2: Concurrent Equip Operations
- [ ] Quickly equip 3 different frames in succession
- [ ] Expected: Last equip wins
- [ ] Verify no race conditions or duplicate updates

### Test 5.3: Large Image Upload
- [ ] Try to upload image > 2MB
- [ ] Expected: Client-side validation blocks it
- [ ] Alert: "Image must be less than 2MB"

### Test 5.4: Invalid File Type Upload
- [ ] Try to upload non-image file (.txt, .pdf)
- [ ] Expected: Client-side validation blocks it
- [ ] Alert: "Please select an image file"

### Test 5.5: Network Timeout During Upload
- [ ] Start image upload
- [ ] Simulate network failure mid-upload
- [ ] Expected: Error message displayed
- [ ] Verify Firestore not updated with partial data

---

## PHASE 6: Performance & UX Tests

### Test 6.1: Equip Responsiveness
- [ ] Equip an avatar
- [ ] Expected: UI updates IMMEDIATELY (< 100ms perceived)
- [ ] Verify no loading spinners or delays

### Test 6.2: Shop Load Time
- [ ] Clear browser cache
- [ ] Open Shop
- [ ] Measure time to full render
- [ ] Expected: < 2 seconds with 20+ custom avatars

### Test 6.3: Custom Avatar Load Time
- [ ] Verify custom avatars appear in shop
- [ ] Expected: Images load progressively
- [ ] No broken images or 404s

### Test 6.4: Equip State Accuracy
- [ ] In Collection mode, verify only owned items show
- [ ] Verify exactly ONE frame shows "✓ Equipped"
- [ ] Verify exactly ONE background shows "✓ Equipped"
- [ ] Switch to Store mode, verify equipped states consistent

---

## PHASE 7: Mobile & Browser Compatibility

### Test 7.1: Mobile Safari (iOS)
- [ ] Test all equip/unequip flows
- [ ] Verify touch interactions work
- [ ] Test admin upload on mobile (file picker)

### Test 7.2: Mobile Chrome (Android)
- [ ] Test all equip/unequip flows
- [ ] Test admin upload with camera capture

### Test 7.3: Desktop Browsers
- [ ] Chrome - verify all flows
- [ ] Firefox - verify all flows
- [ ] Safari - verify all flows
- [ ] Edge - verify all flows

---

## PHASE 8: Data Consistency Tests

### Test 8.1: Firestore vs State Sync
- [ ] Equip an avatar
- [ ] Check Firestore directly (Firebase Console)
- [ ] Verify `equippedFrame` and `equippedBackground` match state
- [ ] Check `inventory` array contains equipped items

### Test 8.2: Multiple Device Sync
- [ ] Log in on Device A, equip `frame_clean`
- [ ] Log in on Device B (same user)
- [ ] Expected: `frame_clean` is equipped on Device B
- [ ] Equip `bg_purple` on Device B
- [ ] Expected: Both devices show `frame_clean` + `bg_purple`

### Test 8.3: Guest User Isolation
- [ ] Play as guest user
- [ ] Purchase and equip items
- [ ] Data stored in localStorage
- [ ] Log in as authenticated user
- [ ] Expected: Guest data does NOT affect authenticated user

---

## PASS CRITERIA

✅ **ALL tests must PASS** before deploying to production

### Critical (Must Pass)
- [x] Test 1.2: Inventory validation works
- [x] Test 1.3: Invalid items auto-cleanup
- [x] Test 2.2: Non-admin upload blocked
- [x] Test 4.5: No secrets in source code
- [x] Test 5.1: Offline handling works

### High Priority (Should Pass)
- [x] Test 1.5: Persistence across sessions
- [x] Test 2.3: Custom avatar equip works
- [x] Test 3.1/3.2: Unequip works correctly
- [x] Test 6.1: Equip is instant

### Medium Priority (Nice to Have)
- [x] Test 6.2: Shop loads quickly
- [x] Test 7.x: Cross-browser compatibility
- [x] Test 8.2: Multi-device sync

---

## Bug Reporting Template

If a test fails, document:

```markdown
**Test:** [Test number and name]
**Status:** FAILED
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Console Errors:**
[Paste any console errors]

**Screenshots:**
[Attach if applicable]

**Browser/Device:**
[e.g., Chrome 120 on Windows 11]
```

---

**Last Updated:** 2026-01-15
**Test Status:** READY FOR TESTING
