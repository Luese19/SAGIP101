const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:19006"], // React and React Native
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Game state management
const gameRooms = new Map();
const players = new Map();

// Question database
const questions = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correct: 2,
    category: "Geography"
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct: 1,
    category: "Science"
  },
  {
    id: 3,
    question: "In which year did World War II end?",
    options: ["1942", "1945", "1948", "1950"],
    correct: 1,
    category: "History"
  },
  {
    id: 4,
    question: "Who directed the movie 'Titanic'?",
    options: ["Steven Spielberg", "James Cameron", "Martin Scorsese", "Christopher Nolan"],
    correct: 1,
    category: "Movies"
  },
  {
    id: 5,
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correct: 2,
    category: "Science"
  }
];

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

  // Create room
  socket.on('create_room', (data) => {
    const roomId = uuidv4().substr(0, 8);
    const playerData = {
      id: socket.id,
      name: data.playerName || `Player_${socket.id.substr(0, 4)}`,
      health: 100,
      skillPoints: 0,
      isHost: true,
      isReady: false
    };

    gameRooms.set(roomId, {
      id: roomId,
      hostId: socket.id,
      players: [playerData],
      gameState: 'waiting', // waiting, playing, finished
      currentQuestion: null,
      questionTimer: null,
      currentTurn: null,
      skills: { [socket.id]: {} }
    });

    players.set(socket.id, {
      roomId,
      playerData
    });

    socket.join(roomId);
    socket.emit('room_created', { roomId, player: playerData });
    socket.emit('room_players', { players: [playerData] });

    console.log(`Room created: ${roomId} by ${playerData.name}`);
  });

  // Join room
  socket.on('join_room', (data) => {
    const { roomId, playerName } = data;
    const room = gameRooms.get(roomId);

    if (!room) {
      socket.emit('error_message', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= 4) {
      socket.emit('error_message', { message: 'Room is full (max 4 players)' });
      return;
    }

    const playerData = {
      id: socket.id,
      name: playerName || `Player_${socket.id.substr(0, 4)}`,
      health: 100,
      skillPoints: 0,
      isHost: false,
      isReady: false
    };

    room.players.push(playerData);
    players.set(socket.id, {
      roomId,
      playerData
    });

    socket.join(roomId);

    // Notify room about new player
    socket.to(roomId).emit('player_joined', { player: playerData });
    socket.emit('room_joined', { 
      roomId, 
      player: playerData,
      players: room.players 
    });

    console.log(`${playerData.name} joined room ${roomId}`);
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

    // Check if all players are ready and room is full
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

    // Calculate points for correct answer
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
        // Will be applied when next player answers wrong
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
        
        // If room is empty, delete it
        if (room.players.length === 0) {
          gameRooms.delete(playerInfo.roomId);
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
            io.to(playerInfo.roomId).emit('host_changed', { newHost: room.players[0].name });
          }
        }
      }
      players.delete(socket.id);
    }
  });
});

// Game functions
function startGame(roomId) {
  const room = gameRooms.get(roomId);
  if (!room) return;

  room.gameState = 'playing';
  room.currentTurn = room.players[0].id;
  
  // Start first question
  nextQuestion(roomId);
  
  io.to(roomId).emit('game_started', { 
    players: room.players,
    currentTurn: room.currentTurn 
  });

  console.log(`Game started in room ${roomId}`);
}

function nextQuestion(roomId) {
  const room = gameRooms.get(roomId);
  if (!room || room.gameState !== 'playing') return;

  // Get random question
  const question = questions[Math.floor(Math.random() * questions.length)];
  room.currentQuestion = question;

  // Set 5-second timer
  room.questionTimer = setTimeout(() => {
    processAnswer(roomId, room.currentTurn, false); // Auto-fail on timeout
  }, 5000);

  io.to(roomId).emit('new_question', {
    question: question.question,
    options: question.options,
    category: question.category,
    timer: 5
  });

  // Start countdown timer
  let timeLeft = 5;
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

  io.to(roomId).emit('game_ended', {
    winner: winner ? winner.name : null,
    players: room.players
  });

  console.log(`Game ended in room ${roomId}, winner: ${winner?.name || 'None'}`);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    rooms: gameRooms.size, 
    players: players.size,
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
    players: room.players.length,
    gameState: room.gameState,
    host: room.players.find(p => p.id === room.hostId)?.name || 'Unknown'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Quiz Duel server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});