import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import io from 'socket.io-client';
import { useAuth } from './contexts/AuthContext';

// Components
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import Lobby from './components/Lobby';
import RoomWaiting from './components/RoomWaiting';
import GameScreen from './components/GameScreen';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
`;

const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: white;
  font-size: 1.5rem;
`;

const ErrorMessage = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff4757;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 1000;
  font-size: 14px;
`;

function App() {
  const { currentUser, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentRoomData, setCurrentRoomData] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState(null);
  const [connectionError, setConnectionError] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);

  // Initialize socket connection for authenticated users
  useEffect(() => {
    if (!currentUser) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'], // Try polling first, fallback to websocket
      timeout: 20000, // Increase timeout to 20 seconds
      forceNew: true,
      auth: {
        uid: currentUser.uid,
        displayName: currentUser.displayName
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnectionError('');
      
      // Request available rooms on connection
      newSocket.emit('get_rooms');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionError('Failed to connect to server. Please check if the server is running.');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionError('Connection lost. Please refresh the page.');
    });

    // Room events
    newSocket.on('room_created', (data) => {
      setCurrentRoom(data.roomId);
      setCurrentRoomData(data.room);
      setCurrentPlayer({
        ...data.player,
        uid: currentUser.uid,
        displayName: currentUser.displayName
      });
      setPlayers(data.players || [data.player]);
      setTeams(data.room?.teams || null);
      // Navigate to waiting room after creating
      navigate(`/room/${data.roomId}/waiting`);
    });

    newSocket.on('room_joined', (data) => {
      setCurrentRoom(data.roomId);
      setCurrentRoomData(data.room);
      setCurrentPlayer({
        ...data.player,
        uid: currentUser.uid,
        displayName: currentUser.displayName
      });
      setPlayers(data.players);
      setTeams(data.room?.teams || null);
      // Navigate to waiting room after joining
      navigate(`/room/${data.roomId}/waiting`);
    });

    newSocket.on('room_players', (data) => {
      setPlayers(data.players);
    });

    newSocket.on('player_joined', (data) => {
      setPlayers(prev => [...prev, data.player]);
    });

    newSocket.on('player_left', (data) => {
      setPlayers(data.players);
    });

    newSocket.on('players_updated', (data) => {
      setPlayers(data.players);
    });

    newSocket.on('host_changed', (data) => {
      console.log('Host changed to:', data.newHost);
    });

    // Room discovery events
    newSocket.on('room_list', (data) => {
      setAvailableRooms(data.rooms || []);
    });

    // Game events
    newSocket.on('game_started', (data) => {
      setPlayers(data.players);
    });

    newSocket.on('game_ended', (data) => {
      setPlayers(data.players);

      // Update user stats when game ends
      // This would typically be handled in GameScreen component
    });

    // Error handling
    newSocket.on('error_message', (data) => {
      setConnectionError(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [currentUser, navigate]);

  // Enhanced socket wrapper functions
  const createRoom = (roomData) => {
    if (socket) {
      const { name, gameMode, category, maxPlayers } = roomData;
      socket.emit('create_room', {
        playerName: currentUser.displayName || 'Player',
        roomName: name,
        gameMode: gameMode,
        category: category,
        maxPlayers: maxPlayers,
        uid: currentUser.uid
      });
    }
  };

  const joinRoom = (roomId, playerName) => {
    if (socket) {
      socket.emit('join_room', { 
        roomId, 
        playerName: playerName || currentUser.displayName || 'Player',
        uid: currentUser.uid
      });
    }
  };

  const getAvailableRooms = () => {
    if (socket) {
      socket.emit('get_rooms');
    }
  };

  const setPlayerReady = () => {
    if (socket) {
      socket.emit('player_ready');
    }
  };

  const startGame = () => {
    if (socket) {
      socket.emit('start_game');
    }
  };

  const submitAnswer = (answerIndex) => {
    if (socket) {
      socket.emit('submit_answer', { answerIndex });
    }
  };

  const useSkill = (skillType, targetId) => {
    if (socket) {
      socket.emit('use_skill', { skillType, targetId });
    }
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setCurrentRoomData(null);
    setCurrentPlayer(null);
    setPlayers([]);
    setTeams(null);

    // Refresh room list when returning to lobby
    if (socket) {
      socket.emit('get_rooms');
    }
  };

  const handleStartGame = () => {
    // Navigate to lobby
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentRoom(null);
      setCurrentRoomData(null);
      setCurrentPlayer(null);
      setPlayers([]);
      setTeams(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <AppContainer>
        <LoadingScreen>
          <div>
            <h1>🎯 Quiz Duel: Brain Battle</h1>
            <p>Loading...</p>
          </div>
        </LoadingScreen>
      </AppContainer>
    );
  }

  // Show login/signup if not authenticated
  if (!currentUser) {
    return (
      <AppContainer>
        <Routes>
          <Route path="/login" element={<AuthForm type="login" />} />
          <Route path="/signup" element={<AuthForm type="signup" />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AppContainer>
    );
  }

  // Show main app for authenticated users
  return (
    <AppContainer>
      {connectionError && <ErrorMessage>{connectionError}</ErrorMessage>}
      
      <Routes>
        <Route 
          path="/" 
          element={
            <Dashboard 
              onStartGame={handleStartGame}
              onSignOut={handleSignOut}
            />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <Dashboard 
              onStartGame={handleStartGame}
              onSignOut={handleSignOut}
            />
          } 
        />
        
        <Route
          path="/lobby"
          element={
            <Lobby
              onCreateRoom={createRoom}
              onJoinRoom={joinRoom}
              onGetRooms={getAvailableRooms}
              connectionError={connectionError}
              userName={currentUser.displayName || 'Player'}
              userStats={currentUser.userProfile?.stats}
              availableRooms={availableRooms}
              onGoHome={() => window.location.href = '/dashboard'}
            />
          }
        />
        
        <Route
          path="/room/:roomId/waiting"
          element={
            <RoomWaiting
              roomId={currentRoom}
              players={players}
              currentPlayer={currentPlayer}
              teams={teams}
              maxPlayers={currentRoomData?.maxPlayers} // Pass room's max players
              onSetReady={setPlayerReady}
              onStartGame={startGame}
              onLeaveRoom={leaveRoom}
              onGoHome={() => window.location.href = '/dashboard'}
            />
          }
        />
        
        <Route 
          path="/game/:roomId" 
          element={
            <GameScreen
              socket={socket}
              roomId={currentRoom}
              players={players}
              currentPlayer={currentPlayer}
              onSubmitAnswer={submitAnswer}
              onUseSkill={useSkill}
              onLeaveGame={leaveRoom}
              onGoHome={() => window.location.href = '/dashboard'}
            />
          } 
        />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppContainer>
  );
}

export default App;