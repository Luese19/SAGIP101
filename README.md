# Quiz Duel: Brain Battle 🎯

A real-time multiplayer quiz battle game where players compete to answer trivia questions and use special skills to eliminate opponents.

## 🎮 Game Features

- **4-Player Real-time Multiplayer**: Compete with friends in real-time
- **Interactive Quiz System**: Answer questions across multiple categories (Science, Geography, History, Movies)
- **Skill-based Combat**: Use earned skill points to attack opponents with unique abilities:
  - **Direct Shot** (20 SP): Deal 15 damage to one player
  - **Health Steal** (30 SP): Steal 10 HP from opponent
  - **Time Bomb** (25 SP): 20 damage if next player answers wrong
- **Health System**: Each player starts with 100 HP
- **Turn-based Gameplay**: 5-second timer per question
- **Responsive Design**: Works on desktop and mobile browsers

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **Socket.io** for real-time communication
- **In-memory storage** for game rooms and players

### Frontend
- **React 18** with functional components and hooks
- **Styled Components** for styling
- **Socket.io Client** for real-time connection
- **Responsive design** for all screen sizes

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
2. **Install all dependencies**:
   ```bash
   npm run install-all
   ```

### Running the Game

#### Option 1: Run both client and server together
```bash
npm run dev
```

#### Option 2: Run separately

**Terminal 1 - Start the server:**
```bash
npm run server
```

**Terminal 2 - Start the React client:**
```bash
npm run client
```

### Access the Game
- Open your browser and go to: `http://localhost:3000`
- The server runs on: `http://localhost:5000`

## 🎯 How to Play

### Creating/Joining a Game
1. **Enter your name** in the lobby
2. **Create a new room** or **join an existing room** with a room ID
3. **Wait for other players** to join (2-4 players needed)
4. **Click "Ready Up"** when you're prepared to start

### Gameplay
1. **Answer Questions**: When it's your turn, select the correct answer within 5 seconds
2. **Earn Skill Points**: Correct answers grant 10 skill points
3. **Use Skills**: Spend skill points to attack opponents during your turn
4. **Survive**: Maintain your health above 0 to stay in the game
5. **Win**: Be the last player standing to win the game!

### Skills System
- **Direct Shot**: Reliable damage dealer
- **Health Steal**: Gain health while damaging opponents
- **Time Bomb**: Strategic trap for the next player

## 🏗 Project Structure

```
quiz-duel-brain-battle/
├── package.json                 # Root package.json with scripts
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── server/
│   └── index.js                 # Express + Socket.io server
└── client/
    ├── package.json             # React app dependencies
    ├── public/
    │   └── index.html           # HTML template
    └── src/
        ├── index.js             # React entry point
        ├── App.js               # Main app component
        └── components/
            ├── Lobby.js         # Main lobby for creating/joining rooms
            ├── RoomWaiting.js   # Room waiting area
            └── GameScreen.js    # Main game interface
```

## 🎨 UI/UX Features

### Lobby Screen
- Clean, modern design with gradient background
- Player name input with validation
- Room creation and joining functionality
- Error handling for connection issues

### Room Waiting Area
- Real-time player list with status indicators
- Host identification
- Ready/unready status tracking
- Game instructions and rules

### Game Interface
- **Player Panels**: Health bars, skill points, current player highlighting
- **Question Display**: Clean typography with category and timer
- **Interactive Elements**: Answer buttons with hover effects
- **Skill Panel**: Available skills with costs and descriptions
- **Visual Feedback**: Timer animation, answer result highlighting

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Client Configuration
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Customization Options

**Question Database**: Add more questions in `server/index.js`:
```javascript
const questions = [
  // Add your custom questions here
  {
    id: 6,
    question: "Your question here?",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
    correct: 0, // Index of correct answer
    category: "Your Category"
  }
];
```

**Skills Configuration**: Modify skill values in `server/index.js`:
```javascript
const SKILLS = {
  DIRECT_SHOT: {
    name: "Direct Shot",
    cost: 20,        // Skill point cost
    damage: 15,      // Damage dealt
    description: "Deal 15 damage to one player"
  },
  // Add or modify other skills...
};
```

## 🌐 Deployment

### Backend Deployment (Heroku/Railway)
1. Set environment variables on your hosting platform
2. Ensure the server listens on the correct port
3. Configure CORS for your frontend domain

### Frontend Deployment (Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy the `client/build` folder
3. Set `REACT_APP_SOCKET_URL` to your backend URL

## 🔮 Future Enhancements

- **User Authentication**: Login/signup system
- **Database Integration**: Persistent user profiles and game history
- **More Question Categories**: Sports, Entertainment, Technology
- **Customizable Skills**: Player-unlockable abilities
- **Tournament Mode**: Bracket-style competitions
- **Mobile App**: React Native version for iOS/Android
- **Chat System**: In-game messaging between players
- **Spectator Mode**: Watch ongoing games
- **Ranking System**: ELO-style player ratings

## 🐛 Troubleshooting

### Common Issues

**"Failed to connect to server"**
- Ensure the server is running on port 5000
- Check if port 5000 is available
- Verify firewall settings

**"Room not found"**
- Double-check the room ID (case-sensitive)
- Ensure the room hasn't been deleted

**Socket connection drops**
- Check internet connection
- Refresh the browser page
- Restart both server and client

## 📝 Development Notes

- The game uses in-memory storage for rooms and players
- Game state is not persisted between server restarts
- Socket.io handles real-time communication with automatic reconnection
- React state management uses hooks and context patterns
- Styled Components for consistent styling across components

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

## 📄 License

MIT License - feel free to use this code for your own projects.

---

**Enjoy playing Quiz Duel: Brain Battle! 🎯**