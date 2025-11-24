# Quiz Duel - React Native (Expo) - FIXED VERSION

A real-time multiplayer quiz battle game converted from React web to React Native with Expo.

## ⚠️ SDK Compatibility Fix

If you're seeing SDK version errors, here are the solutions:

### Option 1: Update to Latest Expo Go (Recommended)
1. Update your Expo Go app to the latest version
2. This project is now compatible with the latest Expo Go

### Option 2: Use Expo Dev Client
If you still have issues, install a dev client:
```bash
npx expo install expo-dev-client
npx expo run:ios    # for iOS
npx expo run:android # for Android
```

## Features

- 🔐 Firebase Authentication (Email/Password)
- 🎯 Real-time multiplayer gaming with Socket.IO
- 📱 Mobile-optimized UI with haptic feedback
- 🏆 Player statistics and achievements
- 🎮 Multiple game modes (Classic, Rapid, Survival)
- 📚 Rich question categories
- 📊 Real-time leaderboards
- 🔔 Push notifications ready

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your phone (for testing) or iOS Simulator/Android Emulator

## Quick Start

### 1. Clone and Install

```bash
cd quiz-duel-rn
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication with Email/Password
4. Enable Firestore Database
5. Copy your Firebase config to `firebase/config.js`

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain", 
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### 3. Server Setup

Ensure your Socket.IO server is running:
```bash
cd server
npm install
npm start
```

Update the server URL in `services/SocketService.js` if needed.

### 4. Run the App

```bash
# Start Expo development server
npx expo start

# For iOS simulator
npx expo start --ios

# For Android emulator
npx expo start --android

# For web (testing)
npx expo start --web
```

### 5. Test on Device

1. Install "Expo Go" from App Store/Google Play
2. Scan the QR code from the terminal
3. The app will load on your device

## 🚨 Troubleshooting SDK Issues

### If you get "Project is incompatible with this version of Expo Go":

**Quick Fix:**
```bash
# Clear Expo cache
npx expo start --clear

# If that doesn't work, install dev client
npx expo install expo-dev-client
npx expo start
```

**Alternative Solutions:**
1. Update your Expo Go app to the latest version
2. Use an older version of Expo CLI: `npm install -g @expo/cli@49.0.0`
3. Use Expo Dev Client for development

### If you get asset errors:
The app.json has been updated to remove problematic asset references. If you still see errors:
```bash
# Clean install
rm -rf node_modules
npm install
npx expo start --clear
```

## Project Structure

```
quiz-duel-rn/
├── App.js                 # Main app entry point
├── app.json              # Expo configuration (FIXED)
├── package.json          # Dependencies
├── babel.config.js       # Babel configuration
├── contexts/
│   └── AuthContext.js    # Authentication context
├── firebase/
│   └── config.js         # Firebase configuration
├── services/
│   ├── SocketService.js  # Socket.IO service with haptics
│   └── HapticService.js  # Haptic feedback service
└── screens/
    ├── AuthScreen.js     # Login/Signup screen
    ├── DashboardScreen.js # Main dashboard
    ├── LobbyScreen.js    # Room creation/joining
    ├── RoomWaitingScreen.js # Waiting room
    └── GameScreen.js     # Quiz game interface
```

## Key Differences from Web Version

### React Native Components Used
- `View` instead of `div`
- `Text` instead of `p`, `h1`, etc.
- `TouchableOpacity` instead of `button`
- `ScrollView`/`FlatList` instead of `div` with scroll
- `TextInput` instead of `input`
- `SafeAreaView` for device-safe areas

### Styling
- StyleSheet API instead of styled-components
- Flexbox layout with React Native
- LinearGradient for backgrounds
- Platform-specific adjustments

### Mobile Features
- Haptic feedback for interactions
- Pull-to-refresh functionality
- Keyboard avoiding behavior
- Safe area handling
- Orientation handling

### Navigation
- React Navigation Stack instead of React Router
- Screen transitions and animations
- Deep linking support

## Game Features

### Authentication
- Email/password signup and login
- User profiles with stats
- Persistent authentication

### Multiplayer Lobby
- Create custom rooms
- Discover public rooms
- Join rooms by ID
- Real-time player updates

### Game Modes
- **Classic**: Traditional quiz with HP system
- **Rapid**: Fast-paced with shorter timers
- **Survival**: Elimination style gameplay

### Question Categories
- General Knowledge, Geography, Science, History
- Sports, Entertainment, Technology, Programming
- Mathematics, Music, and more

### Real-time Features
- Live game state updates
- Player scoreboards
- Answer submission and results
- Game completion stats

## Development

### Hot Reloading
Expo provides fast refresh for instant updates during development.

### Debugging
- Use Flipper or React Native Debugger
- Console.log works for debugging
- React Native Debugger for Redux/Context debugging

### Testing
```bash
# Run tests (if configured)
npm test
```

### Building for Production

#### iOS
```bash
npx expo build:ios
```

#### Android
```bash
npx expo build:android
```

## Troubleshooting

### Socket Connection Issues
- Check if server is running on correct port
- For Android emulator, use `http://10.0.2.2:5000`
- For iOS simulator and devices, use `http://localhost:5000`

### Firebase Issues
- Verify Firebase config is correct
- Check if Authentication and Firestore are enabled
- Ensure app bundle ID matches Firebase config

### Metro Bundler Issues
```bash
npx expo start --clear
```

### Dependency Issues
```bash
rm -rf node_modules
npm install
npx expo install --fix
```

## Performance Optimizations

- FlatList for large datasets
- Image optimization for avatars
- Lazy loading of components
- Proper cleanup of timers and listeners
- Efficient state updates

## Security Considerations

- Firebase Security Rules for Firestore
- Input validation on client side
- Server-side validation for game actions
- Rate limiting for socket events

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information

---

🎮 **Happy quizzing!** 🎮