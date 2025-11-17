import React, { useState } from 'react';
import styled from 'styled-components';

const LobbyContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
`;

const LobbyCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
  font-size: 2.5rem;
  font-weight: bold;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  margin-bottom: 20px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const Button = styled.button`
  flex: 1;
  padding: 15px 25px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }
  
  &.secondary {
    background: #f8f9fa;
    color: #333;
    border: 2px solid #e0e0e0;
    
    &:hover {
      background: #e9ecef;
      border-color: #ccc;
    }
  }
`;

const ErrorMessage = styled.div`
  background: #ffe6e6;
  color: #cc0000;
  padding: 10px;
  border-radius: 5px;
  margin-top: 15px;
  font-size: 14px;
`;

const JoinSection = styled.div`
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #e0e0e0;
`;

const SmallText = styled.p`
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 15px;
`;

function Lobby({ onCreateRoom, onJoinRoom, connectionError }) {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setError('');
    onCreateRoom(playerName.trim());
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }
    
    setError('');
    onJoinRoom(roomId.trim(), playerName.trim());
  };

  return (
    <LobbyContainer>
      <LobbyCard>
        <Title>🎯 Quiz Duel</Title>
        <Subtitle>Brain Battle</Subtitle>
        
        {connectionError && (
          <ErrorMessage>{connectionError}</ErrorMessage>
        )}
        
        {error && (
          <ErrorMessage>{error}</ErrorMessage>
        )}
        
        <Input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              if (roomId) {
                handleJoinRoom();
              } else {
                handleCreateRoom();
              }
            }
          }}
        />
        
        <ButtonGroup>
          <Button 
            className="primary" 
            onClick={handleCreateRoom}
            disabled={!playerName.trim() || !!connectionError}
          >
            Create Room
          </Button>
        </ButtonGroup>
        
        <JoinSection>
          <SmallText>Or join an existing room:</SmallText>
          <Input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleJoinRoom();
              }
            }}
          />
          <Button 
            className="secondary" 
            onClick={handleJoinRoom}
            disabled={!playerName.trim() || !roomId.trim() || !!connectionError}
          >
            Join Room
          </Button>
        </JoinSection>
      </LobbyCard>
    </LobbyContainer>
  );
}

export default Lobby;