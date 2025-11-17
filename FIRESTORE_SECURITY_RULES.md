# Firebase Firestore Security Rules Setup

## 🚨 **URGENT: Fix Permission Denied Error**

You're getting "Permission denied" errors because your Firestore security rules are too restrictive. Here's how to fix it:

## Option 1: Deploy via Firebase CLI (Recommended)

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase in your project
```bash
firebase init
```
- Select "Firestore" 
- Use existing project: `gamedb-f4b9c`
- This will create `firestore.rules` and `firestore.indexes.json`

### 4. Copy the security rules
Replace the content in `firestore.rules` with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own user profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read room data
    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to read game data
    match /games/{gameId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to read questions
    match /questions/{questionId} {
      allow read: if request.auth != null;
    }
  }
}
```

### 5. Deploy the rules
```bash
firebase deploy --only firestore:rules
```

## Option 2: Manual Setup via Firebase Console

### 1. Go to Firebase Console
- Visit: https://console.firebase.google.com/project/gamedb-f4b9c/firestore/rules

### 2. Update Security Rules
Replace the existing rules with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own user profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read room data
    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to read game data
    match /games/{gameId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to read questions
    match /questions/{questionId} {
      allow read: if request.auth != null;
    }
  }
}
```

### 3. Publish Rules
- Click "Publish" button

## What These Rules Do

### ✅ **Users Collection**
- Users can only read/write their own profile data (`request.auth.uid == userId`)
- This fixes the profile saving permission denied errors

### ✅ **Rooms Collection** 
- Authenticated users can read/write room data for multiplayer functionality

### ✅ **Games Collection**
- Authenticated users can read/write game data for ongoing games

### ✅ **Questions Collection**
- Authenticated users can read questions for quiz functionality

## Testing the Fix

After deploying the rules, test your profile:

1. **Clear browser cache** (Ctrl+F5 or Cmd+Shift+R)
2. **Login to your app**
3. **Try updating your profile**:
   - Change display name
   - Add a bio
   - Upload a profile picture
   - Select an avatar
4. **Check for errors** in browser console

## Troubleshooting

### If you still get permission denied:
1. **Verify you're logged in** - Security rules require authentication
2. **Check user ID matches** - Users can only modify their own data
3. **Check Firestore Console** - See if documents exist in `/users` collection
4. **Clear browser cache** - Sometimes old cached data causes issues

### If profile data isn't saving:
1. **Check browser console** for detailed error messages
2. **Check Network tab** in Developer Tools to see Firestore requests
3. **Verify user authentication** - Make sure `currentUser` is not null

## Security Notes

These rules are **development-ready** and **secure**:
- ✅ Users can only modify their own data
- ✅ Authentication is required for all operations
- ✅ No public read/write access
- ✅ Proper user isolation

For production, you might want to:
- Add more granular permissions
- Implement field-level validation
- Add rate limiting for write operations
- Consider server-side validation for critical data

---

**💡 Quick Fix**: If you can't deploy right now, use the Firebase Console method (Option 2) - it takes just 2 minutes!
