#!/bin/bash

# Quiz Duel React Native Setup Script
echo "🎯 Setting up Quiz Duel React Native..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "⚡ Installing Expo CLI..."
    npm install -g @expo/cli
fi

echo "✅ Expo CLI is installed"

# Check if .env file exists (for Firebase config)
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. You'll need to configure Firebase in firebase/config.js"
    echo "📖 Please check the README.md for Firebase setup instructions"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure Firebase in firebase/config.js"
echo "2. Ensure your Socket.IO server is running"
echo "3. Run 'npx expo start' to start the app"
echo ""
echo "📱 To test on device:"
echo "- Install 'Expo Go' from App Store/Google Play"
echo "- Scan the QR code from 'npx expo start'"
echo ""
echo "Happy coding! 🚀"