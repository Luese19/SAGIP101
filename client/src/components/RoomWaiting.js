import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const WaitingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
`;

const WaitingCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  text-align: center;
`;

const RoomInfo = styled.div`
  margin-bottom: 30px;
`;

const RoomId = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 25px;
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 20px;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
`;

const PlayersList = styled.div`
  margin: 30px 0;
`;

const PlayerCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => {
    if (props.isCurrentPlayer) return '#e8f4fd';
    if (props.teamId === 'A') return '#e8f5e8';
    if (props.teamId === 'B') return '#fff3e0';
    return '#f8f9fa';
  }};
  border: 2px solid ${props => {
    if (props.isCurrentPlayer) return '#667eea';
    if (props.teamId === 'A') return '#4caf50';
    if (props.teamId === 'B') return '#ff9800';
    return '#e0e0e0';
  }};
  border-radius: 10px;
  padding: 15px 20px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const PlayerAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
`;

const PlayerName = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
`;

const PlayerStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HostBadge = styled.span`
  background: #ffd700;
  color: #333;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
`;

const TeamBadge = styled.span`
  background: ${props => props.teamId === 'A' ? '#4caf50' : '#ff9800'};
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-left: 8px;
`;

const ReadyBadge = styled.span`
  background: ${props => props.ready ? '#4caf50' : '#ff9800'};
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.ready ? '#4caf50' : '#ff9800'};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;
`;

const Button = styled.button`
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover:not(:disabled) {
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

const GameStartIndicator = styled.div`
  background: #e8f5e8;
  border: 2px solid #4caf50;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
  color: #2e7d32;
  font-weight: 600;
`;

const Instructions = styled.div`
  background: #f0f7ff;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
  text-align: left;
`;

const InstructionsTitle = styled.h3`
  color: #1976d2;
  margin-bottom: 10px;
`;

const InstructionsList = styled.ul`
  color: #555;
  line-height: 1.6;
  
  li {
    margin-bottom: 5px;
  }
`;

function RoomWaiting({ roomId, players, currentPlayer, teams, onSetReady, onLeaveRoom }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Reset ready state when component mounts
    setIsReady(false);
  }, []);

  const handleReadyToggle = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    if (newReadyState) {
      onSetReady();
    }
  };

  const handleLeaveRoom = () => {
    onLeaveRoom();
  };

  const isTeamMode = teams !== null;
  const maxPlayers = isTeamMode ? (teams?.teamA ? 6 : 4) : 4; // Simplified for now
  const canStartGame = !isTeamMode && players.length >= 2 && players.every(p => p.isReady);
  const playerCount = players.length;
  const isRoomFull = playerCount >= maxPlayers;

  return (
    <WaitingContainer>
      <WaitingCard>
        <RoomInfo>
          <h2>🎯 Room Waiting Area</h2>
          <RoomId>Room ID: {roomId}</RoomId>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            {playerCount}/{maxPlayers} Players Joined
            {isTeamMode && <span style={{ color: '#4caf50', fontWeight: 'bold' }}> (Team Mode)</span>}
          </p>
          {isRoomFull && isTeamMode && (
            <p style={{ color: '#ff9800', fontSize: '1rem', fontWeight: 'bold' }}>
              ⚡ Room is full! Game starting automatically...
            </p>
          )}
        </RoomInfo>

        <PlayersList>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>
            {teams ? 'Teams' : 'Players'}
          </h3>
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              isCurrentPlayer={player.id === currentPlayer?.id}
              teamId={player.teamId}
            >
              <PlayerInfo>
                <PlayerAvatar>
                  {player.name.charAt(0).toUpperCase()}
                </PlayerAvatar>
                <PlayerName>{player.name}</PlayerName>
                {player.teamId && (
                  <TeamBadge teamId={player.teamId}>
                    {player.teamName}
                  </TeamBadge>
                )}
              </PlayerInfo>
              <PlayerStatus>
                {player.isHost && <HostBadge>Host</HostBadge>}
                <StatusDot ready={player.isReady} />
                <ReadyBadge ready={player.isReady}>
                  {player.isReady ? 'Ready' : 'Not Ready'}
                </ReadyBadge>
              </PlayerStatus>
            </PlayerCard>
          ))}
        </PlayersList>

        {canStartGame && (
          <GameStartIndicator>
            🎮 All players ready! Game starting soon...
          </GameStartIndicator>
        )}

        <Instructions>
          <InstructionsTitle>🎯 How to Play</InstructionsTitle>
          <InstructionsList>
            {isTeamMode ? (
              <>
                <li>You're assigned to a team automatically</li>
                <li>Work together with your teammates</li>
                <li>Answer questions correctly to earn skill points</li>
                <li>Use skills to attack the opposing team</li>
                <li>Each player starts with 100 HP</li>
                <li>Last team standing wins!</li>
                <li>Game starts automatically when room is full</li>
              </>
            ) : (
              <>
                <li>Answer questions correctly to earn skill points</li>
                <li>Use skill points to attack other players</li>
                <li>Each player starts with 100 HP</li>
                <li>Last player standing wins!</li>
                <li>Game starts automatically when all players are ready</li>
              </>
            )}
          </InstructionsList>
        </Instructions>

        <ButtonGroup>
          {!isTeamMode && (
            <Button
              className="primary"
              onClick={handleReadyToggle}
              disabled={isReady}
            >
              {isReady ? '✓ Ready!' : 'Ready Up'}
            </Button>
          )}
          {isTeamMode && (
            <Button
              className="primary"
              disabled={true}
            >
              {isRoomFull ? '🎮 Game Starting Soon...' : 'Waiting for Players...'}
            </Button>
          )}
          <Button
            className="secondary"
            onClick={handleLeaveRoom}
          >
            Leave Room
          </Button>
        </ButtonGroup>
      </WaitingCard>
    </WaitingContainer>
  );
}

export default RoomWaiting;