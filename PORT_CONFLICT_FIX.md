# 🚨 Port 5000 Conflict Fix

You're getting "EADDRINUSE: address already in use :::5000" because port 5000 is already occupied by your running server.

## ✅ **Option 1: Use Concurrent Development (Recommended)**

Since you already have Terminal 1 running the server, just restart your React client:

### Option A: Stop and restart everything
```bash
# Stop both terminals (Ctrl+C)
# Then run this command:
npm run dev
```

This will start both server (port 5000) and client (port 3000) together using concurrently.

### Option B: Just restart client
```bash
# In Terminal 2 (already running client), just refresh:
# Ctrl+C to stop, then:
cd client && npm start
```

## ⚡ **Option 2: Use Different Port**

If you want to run the server on a different port:

### Update .env file:
```env
PORT=5001
```

### Run server:
```bash
npm run server
```

### Update client socket URL:
In `client/src/App.js`:
```javascript
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';
```

## 🔍 **Current Status Check**

**Terminal 1**: Server running on port 5000 ✅  
**Terminal 2**: Client should be running on port 3000 ✅

If both are running, you should be able to access:
- **Server**: http://localhost:5000/health
- **Client**: http://localhost:3000

## 🎯 **Quick Fix Commands**

```bash
# Kill any process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Or simply use the concurrently command:
npm run dev
```

**Recommended: Use `npm run dev` to start both services together! 🚀**