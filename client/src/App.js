import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
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

function App() {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState('lobby'); // lobby, waiting, playing, finished
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [connectionError, setConnectionError] = useState('');

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnectionError('');
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
      setCurrentPlayer(data.player);
      setGameState('waiting');
      setPlayers(data.players || [data.player]);
    });

    newSocket.on('room_joined', (data) => {
      setCurrentRoom(data.roomId);
      setCurrentPlayer(data.player);
      setPlayers(data.players);
      setGameState('waiting');
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

    // Game events
    newSocket.on('game_started', (data) => {
      setPlayers(data.players);
      setGameState('playing');
    });

    newSocket.on('game_ended', (data) => {
      setPlayers(data.players);
      setGameState('finished');
    });

    // Error handling
    newSocket.on('error_message', (data) => {
      setConnectionError(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Socket wrapper functions
  const createRoom = (playerName) => {
    if (socket) {
      socket.emit('create_room', { playerName });
    }
  };

  const joinRoom = (roomId, playerName) => {
    if (socket) {
      socket.emit('join_room', { roomId, playerName });
    }
  };

  const setPlayerReady = () => {
    if (socket) {
      socket.emit('player_ready');
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
    setGameState('lobby');
    setCurrentRoom(null);
    setCurrentPlayer(null);
    setPlayers([]);
  };

  if (!socket) {
    return (
      <AppContainer>
        <LoadingScreen>
          <div>
            <h1>🎯 Quiz Duel: Brain Battle</h1>
            <p>Connecting to server...</p>
          </div>
        </LoadingScreen>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      {connectionError && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ff4757',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          zIndex: 1000,
          fontSize: '14px'
        }}>
          {connectionError}
        </div>
      )}
      
      {gameState === 'lobby' && (
        <Lobby 
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          connectionError={connectionError}
        />
      )}

      {gameState === 'waiting' && (
        <RoomWaiting
          roomId={currentRoom}
          players={players}
          currentPlayer={currentPlayer}
          onSetReady={setPlayerReady}
          onLeaveRoom={leaveRoom}
        />
      )}

      {gameState === 'playing' && (
        <GameScreen
          socket={socket}
          roomId={currentRoom}
          players={players}
          currentPlayer={currentPlayer}
          onSubmitAnswer={submitAnswer}
          onUseSkill={useSkill}
          onLeaveGame={leaveRoom}
        />
      )}

      {gameState === 'finished' && (
        <GameScreen
          socket={socket}
          roomId={currentRoom}
          players={players}
          currentPlayer={currentPlayer}
          gameFinished={true}
          onSubmitAnswer={submitAnswer}
          onUseSkill={useSkill}
          onLeaveGame={leaveRoom}
        />
      )}
    </AppContainer>
  );
}

export default App;