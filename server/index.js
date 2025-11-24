const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import questions from separate files
const geographyQuestions = require('./questions/geography');
const scienceQuestions = require('./questions/science');
const historyQuestions = require('./questions/history');
const sportsQuestions = require('./questions/sports');
const entertainmentQuestions = require('./questions/entertainment');
const technologyQuestions = require('./questions/technology');
const programmingQuestions = require('./questions/programming');
const literatureQuestions = require('./questions/literature');
const musicQuestions = require('./questions/music');
const moviesQuestions = require('./questions/movies');
const mathematicsQuestions = require('./questions/mathematics');
const animalsQuestions = require('./questions/animals');
const foodQuestions = require('./questions/food');
const artQuestions = require('./questions/art');
const businessQuestions = require('./questions/business');
const healthQuestions = require('./questions/health');
const spaceQuestions = require('./questions/space');
const generalQuestions = require('./questions/general');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const getAllowedOrigins = () => {
  // Check if we're in production (deployed environment)
  const isProduction = process.env.PORT && !process.env.NODE_ENV?.includes('dev');

  if (isProduction) {
    const prodOrigins = [
      "https://quiz-duel-tan.vercel.app",
      "https://sagip-101-git-main-luese-andrey-s-projects.vercel.app",
      "https://sagip-101-2w24466qb-luese-andrey-s-projects.vercel.app",
      "https://sagip101.onrender.com"
    ];

    if (process.env.ALLOW_LOCALHOST === 'true') {
      prodOrigins.push("http://localhost:3000", "http://localhost:19006");
    }

    return prodOrigins;
  }

  return ["http://localhost:3000", "http://localhost:19006"];
};

const io = socketIo(server, {
  cors: {
    origin: getAllowedOrigins(),
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Enhanced game state management
const gameRooms = new Map();
const players = new Map();
const availableRooms = new Map(); // For room discovery

// Game modes configuration
const GAME_MODES = {
  CLASSIC: {
    name: "Classic Battle",
    maxPlayers: 4,
    timerDuration: 5,
    description: "Standard quiz battle with 5-second questions"
  },
  RAPID: {
    name: "Rapid Fire",
    maxPlayers: 4,
    timerDuration: 3,
    description: "Fast-paced 3-second questions"
  },
  SURVIVAL: {
    name: "Survival Mode",
    maxPlayers: 4,
    timerDuration: 5,
    description: "No health system - elimination style"
  }
};

// Enhanced Question categories configuration
const CATEGORIES = {
  GEOGRAPHY: {
    name: "Geography",
    icon: "🌍",
    color: "#4CAF50",
    description: "Countries, capitals, landmarks, and world geography"
  },
  SCIENCE: {
    name: "Science",
    icon: "🔬",
    color: "#2196F3",
    description: "Biology, chemistry, physics, and scientific concepts"
  },
  HISTORY: {
    name: "History",
    icon: "📜",
    color: "#FF9800",
    description: "Ancient civilizations to modern history"
  },
  SPORTS: {
    name: "Sports",
    icon: "⚽",
    color: "#9C27B0",
    description: "Football, basketball, Olympics, and sports trivia"
  },
  ENTERTAINMENT: {
    name: "Entertainment",
    icon: "🎬",
    color: "#E91E63",
    description: "Movies, TV shows, music, and celebrity trivia"
  },
  TECHNOLOGY: {
    name: "Technology",
    icon: "💻",
    color: "#607D8B",
    description: "Computers, internet, tech companies, and innovations"
  },
  PROGRAMMING: {
    name: "Programming & Development",
    icon: "⚡",
    color: "#FF6B35",
    description: "Programming languages, frameworks, algorithms, and software development"
  },
  LITERATURE: {
    name: "Literature",
    icon: "📚",
    color: "#795548",
    description: "Classic books, authors, and literary works"
  },
  MUSIC: {
    name: "Music",
    icon: "🎵",
    color: "#FF5722",
    description: "Rock, pop, classical music, and music history"
  },
  MOVIES: {
    name: "Movies",
    icon: "🎭",
    color: "#3F51B5",
    description: "Hollywood cinema, directors, and film trivia"
  },
  MATHEMATICS: {
    name: "Mathematics",
    icon: "🧮",
    color: "#009688",
    description: "Algebra, geometry, calculus, and math concepts"
  },
  ANIMALS: {
    name: "Animals & Nature",
    icon: "🐾",
    color: "#8D6E63",
    description: "Wildlife, pets, marine life, and nature facts"
  },
  FOOD: {
    name: "Food & Cooking",
    icon: "🍳",
    color: "#FF8A65",
    description: "Cuisines, ingredients, cooking, and food culture"
  },
  ART: {
    name: "Art & Culture",
    icon: "🎨",
    color: "#BA68C8",
    description: "Fine arts, paintings, sculptures, and cultural topics"
  },
  BUSINESS: {
    name: "Business & Economics",
    icon: "💼",
    color: "#4DB6AC",
    description: "Finance, economics, companies, and business concepts"
  },
  HEALTH: {
    name: "Health & Medicine",
    icon: "🏥",
    color: "#F06292",
    description: "Anatomy, diseases, medicine, and health facts"
  },
  SPACE: {
    name: "Space & Astronomy",
    icon: "🚀",
    color: "#7E57C2",
    description: "Planets, stars, space exploration, and astronomy"
  },
  GENERAL: {
    name: "General Knowledge",
    icon: "🧠",
    color: "#8BC34A",
    description: "Mixed topics - test your overall knowledge!"
  }
};

// Expanded Question Database by Category
const questions = {
  GEOGRAPHY: geographyQuestions,
  SCIENCE: scienceQuestions,
  HISTORY: historyQuestions,
  SPORTS: sportsQuestions,
  ENTERTAINMENT: entertainmentQuestions,
  TECHNOLOGY: technologyQuestions,
  PROGRAMMING: programmingQuestions,
  LITERATURE: literatureQuestions,
  MUSIC: musicQuestions,
  MOVIES: moviesQuestions,
  MATHEMATICS: mathematicsQuestions,
  ANIMALS: animalsQuestions,
  FOOD: foodQuestions,
  ART: artQuestions,
  BUSINESS: businessQuestions,
  HEALTH: healthQuestions,
  SPACE: spaceQuestions,
  GENERAL: generalQuestions
};

// Get all questions as a flat array
const getAllQuestions = () => {
  return Object.values(questions).flat();
};

// Get questions by category
const getQuestionsByCategory = (category) => {
  return questions[category] || [];
};

// Skills configuration
const SKILLS = {
  DIRECT_SHOT: {
    name: "Direct Shot",
    cost: 20,
    damage: 15,
    description: "Deal 15 damage to one player"
  },
  HEALTH_STEAL: {
    name: "Health Steal",
    cost: 30,
    damage: 10,
    description: "Steal 10 HP from opponent"
  },
  TIME_BOMB: {
    name: "Time Bomb",
    cost: 25,
    damage: 20,
    description: "20 damage if next player answers wrong"
  }
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Create room with enhanced features
  socket.on('create_room', (data) => {
    const roomId = uuidv4().substr(0, 8).toUpperCase();
    const { playerName, roomName, gameMode = 'CLASSIC', category = 'GENERAL' } = data;
    const mode = GAME_MODES[gameMode] || GAME_MODES.CLASSIC;
    const selectedCategory = CATEGORIES[category] || CATEGORIES.GENERAL;
    
    const playerData = {
      id: socket.id,
      name: playerName || `Player_${socket.id.substr(0, 4)}`,
      health: 100,
      skillPoints: 0,
      isHost: true,
      isReady: false,
      uid: data.uid || null,
      displayName: playerName || null
    };

    const roomData = {
      id: roomId,
      name: roomName || `${playerData.name}'s Room`,
      hostId: socket.id,
      players: [playerData],
      gameState: 'waiting',
      currentQuestion: null,
      questionTimer: null,
      currentTurn: null,
      skills: { [socket.id]: {} },
      gameMode: gameMode,
      timerDuration: mode.timerDuration,
      maxPlayers: mode.maxPlayers,
      category: category,
      categoryInfo: selectedCategory,
      createdAt: new Date().toISOString()
    };

    gameRooms.set(roomId, roomData);
    availableRooms.set(roomId, {
      id: roomId,
      name: roomData.name,
      players: 1,
      maxPlayers: mode.maxPlayers,
      gameMode: gameMode,
      gameState: 'waiting',
      host: playerData.name,
      category: category,
      categoryInfo: selectedCategory,
      createdAt: roomData.createdAt
    });

    players.set(socket.id, {
      roomId,
      playerData
    });

    socket.join(roomId);
    socket.emit('room_created', { roomId, player: playerData, room: roomData });
    socket.emit('room_players', { players: [playerData] });

    // Broadcast room list update
    broadcastRoomList();

    console.log(`Room created: ${roomId} by ${playerData.name} (${gameMode} - ${selectedCategory.name})`);
  });

  // Join room
  socket.on('join_room', (data) => {
    const { roomId, playerName, uid } = data;
    const room = gameRooms.get(roomId);

    if (!room) {
      socket.emit('error_message', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error_message', { message: `Room is full (max ${room.maxPlayers} players)` });
      return;
    }

    if (room.gameState !== 'waiting') {
      socket.emit('error_message', { message: 'Game already in progress' });
      return;
    }

    const playerData = {
      id: socket.id,
      name: playerName || `Player_${socket.id.substr(0, 4)}`,
      health: 100,
      skillPoints: 0,
      isHost: false,
      isReady: false,
      uid: uid || null,
      displayName: playerName || null
    };

    room.players.push(playerData);
    players.set(socket.id, {
      roomId,
      playerData
    });

    socket.join(roomId);

    // Update available rooms
    const roomInfo = availableRooms.get(roomId);
    if (roomInfo) {
      roomInfo.players = room.players.length;
      availableRooms.set(roomId, roomInfo);
    }

    // Notify room about new player
    socket.to(roomId).emit('player_joined', { player: playerData });
    socket.emit('room_joined', { 
      roomId, 
      player: playerData,
      players: room.players,
      room: room
    });

    // Broadcast room list update
    broadcastRoomList();

    console.log(`${playerData.name} joined room ${roomId} (${room.categoryInfo.name})`);
  });

  // Get available rooms (for room discovery)
  socket.on('get_rooms', () => {
    const rooms = Array.from(availableRooms.values())
      .filter(room => room.gameState === 'waiting' && room.players < room.maxPlayers)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    socket.emit('room_list', { rooms });
  });

  // Player ready status
  socket.on('player_ready', () => {
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;

    const room = gameRooms.get(playerInfo.roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = true;
      io.to(playerInfo.roomId).emit('players_updated', { players: room.players });
    }

    // Check if all players are ready and room has minimum players
    if (room.players.length >= 2 && room.players.every(p => p.isReady)) {
      startGame(playerInfo.roomId);
    }
  });

  // Submit answer
  socket.on('submit_answer', (data) => {
    const { answerIndex } = data;
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;

    const room = gameRooms.get(playerInfo.roomId);
    if (!room || room.gameState !== 'playing') return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || room.currentTurn !== socket.id) return;

    // Calculate points for correct answer (faster answers = more points)
    const isCorrect = answerIndex === room.currentQuestion.correct;
    const pointsEarned = isCorrect ? 10 : 0;
    player.skillPoints += pointsEarned;

    // Process answer and move to next turn
    processAnswer(playerInfo.roomId, socket.id, isCorrect);
  });

  // Use skill
  socket.on('use_skill', (data) => {
    const { skillType, targetId } = data;
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;

    const room = gameRooms.get(playerInfo.roomId);
    if (!room || room.gameState !== 'playing') return;

    const player = room.players.find(p => p.id === socket.id);
    const target = room.players.find(p => p.id === targetId);
    
    if (!player || !target) return;

    const skill = SKILLS[skillType];
    if (!skill || player.skillPoints < skill.cost) return;

    // Apply skill effect
    player.skillPoints -= skill.cost;
    
    switch (skillType) {
      case 'DIRECT_SHOT':
        target.health = Math.max(0, target.health - skill.damage);
        break;
      case 'HEALTH_STEAL':
        target.health = Math.max(0, target.health - skill.damage);
        player.health = Math.min(100, player.health + skill.damage);
        break;
      case 'TIME_BOMB':
        room.timeBomb = { targetId: target.id, active: true };
        break;
    }

    // Check if target is eliminated
    if (target.health <= 0) {
      eliminatePlayer(playerInfo.roomId, target.id);
    }

    io.to(playerInfo.roomId).emit('skill_used', {
      player: player.name,
      skill: skill.name,
      target: target.name,
      effect: {
        playerHealth: player.health,
        targetHealth: target.health,
        playerSP: player.skillPoints
      }
    });
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const playerInfo = players.get(socket.id);
    
    if (playerInfo) {
      const room = gameRooms.get(playerInfo.roomId);
      if (room) {
        // Remove player from room
        room.players = room.players.filter(p => p.id !== socket.id);
        
        // Update available rooms
        const roomInfo = availableRooms.get(playerInfo.roomId);
        if (roomInfo) {
          roomInfo.players = room.players.length;
          if (room.players.length === 0) {
            availableRooms.delete(playerInfo.roomId);
          } else {
            availableRooms.set(playerInfo.roomId, roomInfo);
          }
        }
        
        // If room is empty, delete it
        if (room.players.length === 0) {
          gameRooms.delete(playerInfo.roomId);
          availableRooms.delete(playerInfo.roomId);
          console.log(`Room ${playerInfo.roomId} deleted (empty)`);
        } else {
          // Notify remaining players
          io.to(playerInfo.roomId).emit('player_left', { 
            playerId: socket.id,
            players: room.players 
          });
          
          // If host left, assign new host
          if (socket.id === room.hostId) {
            room.hostId = room.players[0].id;
            room.players[0].isHost = true;
            
            const roomInfo = availableRooms.get(playerInfo.roomId);
            if (roomInfo) {
              roomInfo.host = room.players[0].name;
              availableRooms.set(playerInfo.roomId, roomInfo);
            }
            
            io.to(playerInfo.roomId).emit('host_changed', { newHost: room.players[0].name });
          }
        }
      }
      players.delete(socket.id);
      
      // Broadcast room list update
      broadcastRoomList();
    }
  });
});

// Helper function to broadcast room list updates
function broadcastRoomList() {
  const rooms = Array.from(availableRooms.values())
    .filter(room => room.gameState === 'waiting' && room.players < room.maxPlayers)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  io.emit('room_list', { rooms });
}

// Game functions
function startGame(roomId) {
  const room = gameRooms.get(roomId);
  if (!room) return;

  room.gameState = 'playing';
  room.currentTurn = room.players[0].id;
  
  // Update room status in available rooms
  const roomInfo = availableRooms.get(roomId);
  if (roomInfo) {
    roomInfo.gameState = 'playing';
    availableRooms.set(roomId, roomInfo);
  }
  
  // Start first question
  nextQuestion(roomId);
  
  io.to(roomId).emit('game_started', { 
    players: room.players,
    currentTurn: room.currentTurn,
    gameMode: room.gameMode,
    timerDuration: room.timerDuration,
    category: room.category,
    categoryInfo: room.categoryInfo
  });

  console.log(`Game started in room ${roomId} (${room.gameMode} - ${room.categoryInfo.name})`);
}

function nextQuestion(roomId) {
  const room = gameRooms.get(roomId);
  if (!room || room.gameState !== 'playing') return;

  // Get questions based on room category
  let availableQuestions = [];
  
  if (room.category === 'GENERAL') {
    // If general knowledge, mix questions from all categories
    availableQuestions = getAllQuestions();
  } else {
    // Get questions from specific category
    availableQuestions = getQuestionsByCategory(room.category);
  }
  
  // If no questions in category, fallback to general
  if (availableQuestions.length === 0) {
    availableQuestions = getAllQuestions();
  }
  
  // Get random question from available questions
  const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  room.currentQuestion = question;

  // Set timer based on game mode
  const timerDuration = room.timerDuration * 1000;
  room.questionTimer = setTimeout(() => {
    processAnswer(roomId, room.currentTurn, false); // Auto-fail on timeout
  }, timerDuration);

  io.to(roomId).emit('new_question', {
    question: question.question,
    options: question.options,
    category: question.category,
    timer: room.timerDuration
  });

  // Start countdown timer
  let timeLeft = room.timerDuration;
  const countdown = setInterval(() => {
    timeLeft--;
    io.to(roomId).emit('timer_update', { timeLeft });
    
    if (timeLeft <= 0) {
      clearInterval(countdown);
    }
  }, 1000);
}

function processAnswer(roomId, playerId, isCorrect) {
  const room = gameRooms.get(roomId);
  if (!room) return;

  // Clear timer
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
  }

  // Apply time bomb if active
  if (room.timeBomb && room.timeBomb.active && !isCorrect) {
    const target = room.players.find(p => p.id === room.timeBomb.targetId);
    if (target) {
      target.health = Math.max(0, target.health - SKILLS.TIME_BOMB.damage);
      if (target.health <= 0) {
        eliminatePlayer(roomId, target.id);
      }
    }
    room.timeBomb = null; // Reset time bomb
  }

  io.to(roomId).emit('answer_result', {
    playerId,
    isCorrect,
    players: room.players
  });

  // Check for game end
  const alivePlayers = room.players.filter(p => p.health > 0);
  if (alivePlayers.length <= 1) {
    endGame(roomId, alivePlayers[0] || null);
    return;
  }

  // Move to next turn
  const currentIndex = room.players.findIndex(p => p.id === playerId);
  let nextIndex = (currentIndex + 1) % room.players.length;
  
  // Skip eliminated players
  while (room.players[nextIndex].health <= 0) {
    nextIndex = (nextIndex + 1) % room.players.length;
  }

  room.currentTurn = room.players[nextIndex].id;
  io.to(roomId).emit('next_turn', { 
    playerId: room.currentTurn,
    players: room.players 
  });

  // Next question after brief delay
  setTimeout(() => {
    nextQuestion(roomId);
  }, 3000);
}

function eliminatePlayer(roomId, playerId) {
  const room = gameRooms.get(roomId);
  if (!room) return;

  const player = room.players.find(p => p.id === playerId);
  if (player) {
    io.to(roomId).emit('player_eliminated', { 
      playerId,
      playerName: player.name 
    });
  }
}

function endGame(roomId, winner) {
  const room = gameRooms.get(roomId);
  if (!room) return;

  room.gameState = 'finished';
  
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
  }

  // Remove from available rooms
  availableRooms.delete(roomId);

  io.to(roomId).emit('game_ended', {
    winner: winner ? winner.name : null,
    players: room.players,
    gameMode: room.gameMode,
    category: room.category,
    categoryInfo: room.categoryInfo
  });

  console.log(`Game ended in room ${roomId}, winner: ${winner?.name || 'None'} (${room.categoryInfo.name})`);
}

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Quiz Duel Server API',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      rooms: '/rooms',
      categories: '/categories',
      stats: '/stats'
    },
    timestamp: new Date().toISOString()
  });
});

// Enhanced API endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    rooms: gameRooms.size,
    players: players.size,
    categories: Object.keys(CATEGORIES).length,
    totalQuestions: getAllQuestions().length,
    timestamp: new Date().toISOString()
  });
});

// Get room info endpoint
app.get('/room/:roomId', (req, res) => {
  const room = gameRooms.get(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    id: room.id,
    name: room.name,
    players: room.players.length,
    maxPlayers: room.maxPlayers,
    gameState: room.gameState,
    gameMode: room.gameMode,
    category: room.category,
    categoryInfo: room.categoryInfo,
    host: room.players.find(p => p.id === room.hostId)?.name || 'Unknown',
    createdAt: room.createdAt
  });
});

// Get all available rooms (for room discovery)
app.get('/rooms', (req, res) => {
  const rooms = Array.from(availableRooms.values())
    .filter(room => room.gameState === 'waiting' && room.players < room.maxPlayers)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json({ rooms });
});

// Get categories info
app.get('/categories', (req, res) => {
  res.json({ categories: CATEGORIES });
});

// Get questions by category
app.get('/questions/:category', (req, res) => {
  const { category } = req.params;
  const categoryQuestions = getQuestionsByCategory(category);
  res.json({ 
    category,
    questions: categoryQuestions,
    count: categoryQuestions.length
  });
});

// Room statistics endpoint
app.get('/stats', (req, res) => {
  const roomsByCategory = {};
  Object.keys(CATEGORIES).forEach(cat => {
    roomsByCategory[cat] = Array.from(availableRooms.values()).filter(r => r.category === cat).length;
  });

  res.json({
    totalRooms: gameRooms.size,
    availableRooms: availableRooms.size,
    totalPlayers: players.size,
    totalQuestions: getAllQuestions().length,
    categories: Object.keys(CATEGORIES).length,
    roomsByCategory,
    gameModes: {
      classic: Array.from(availableRooms.values()).filter(r => r.gameMode === 'CLASSIC').length,
      rapid: Array.from(availableRooms.values()).filter(r => r.gameMode === 'RAPID').length,
      survival: Array.from(availableRooms.values()).filter(r => r.gameMode === 'SURVIVAL').length
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Quiz Duel server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 Available rooms: http://localhost:${PORT}/rooms`);
  console.log(`📚 Categories: http://localhost:${PORT}/categories`);
  console.log(`📈 Stats: http://localhost:${PORT}/stats`);
  console.log(`🎯 Total Questions: ${getAllQuestions().length} across ${Object.keys(CATEGORIES).length} categories`);
});