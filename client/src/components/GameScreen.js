import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const GameContainer = styled.div`
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
  color: white;
`;

const GameTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

const PlayersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const PlayerCard = styled.div`
  background: ${props => props.isCurrentPlayer ? 
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
    'rgba(255, 255, 255, 0.9)'};
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  color: ${props => props.isCurrentPlayer ? 'white' : '#333'};
  border: 3px solid ${props => props.isActive ? '#4caf50' : 'transparent'};
  transition: all 0.3s ease;
`;

const PlayerName = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 10px;
`;

const HealthBar = styled.div`
  background: #e0e0e0;
  border-radius: 10px;
  height: 20px;
  margin: 10px 0;
  position: relative;
  overflow: hidden;
`;

const HealthFill = styled.div`
  background: linear-gradient(90deg, #4caf50 0%, #8bc34a 100%);
  height: 100%;
  width: ${props => props.percentage}%;
  border-radius: 10px;
  transition: width 0.3s ease;
`;

const HealthText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  font-weight: bold;
  color: #333;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
`;

const SkillPoints = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
`;

const SkillPointIcon = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ffd700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #333;
`;

const SkillPointCount = styled.span`
  font-size: 1.1rem;
  font-weight: bold;
`;

const GameArea = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  flex: 1;
`;

const QuestionCategory = styled.div`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const QuestionText = styled.h2`
  text-align: center;
  color: #333;
  font-size: 1.5rem;
  line-height: 1.4;
  margin-bottom: 30px;
`;

const TimerContainer = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const TimerCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #e0e0e0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: conic-gradient(
    ${props => props.timeLeft <= 2 ? '#f44336' : '#4caf50'} 0deg,
    ${props => props.timeLeft <= 2 ? '#f44336' : '#4caf50'} ${props => props.progress}deg,
    #e0e0e0 ${props => props.progress}deg,
    #e0e0e0 360deg
  );
  
  &::before {
    content: '';
    position: absolute;
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: white;
    z-index: 1;
  }
`;

const TimerText = styled.div`
  position: relative;
  z-index: 2;
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.timeLeft <= 2 ? '#f44336' : '#333'};
`;

const AnswerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 30px;
`;

const AnswerButton = styled.button`
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  
  &:hover:not(:disabled) {
    background: #f0f7ff;
    border-color: #667eea;
    transform: translateY(-2px);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  &.selected {
    background: #e8f4fd;
    border-color: #667eea;
  }
  
  &.correct {
    background: #e8f5e8;
    border-color: #4caf50;
    color: #2e7d32;
  }
  
  &.incorrect {
    background: #ffebee;
    border-color: #f44336;
    color: #c62828;
  }
`;

const SkillPanel = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
`;

const SkillTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
  text-align: center;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const SkillButton = styled.button`
  padding: 15px;
  border: 2px solid ${props => props.available ? '#667eea' : '#e0e0e0'};
  border-radius: 10px;
  background: ${props => props.available ? 'white' : '#f5f5f5'};
  color: ${props => props.available ? '#333' : '#999'};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: ${props => props.available ? 'pointer' : 'not-allowed'};
  transition: all 0.3s ease;
  text-align: center;
  
  &:hover:not(:disabled) {
    background: ${props => props.available ? '#f0f7ff' : '#f5f5f5'};
    border-color: ${props => props.available ? '#764ba2' : '#e0e0e0'};
  }
`;

const SkillDescription = styled.div`
  font-size: 0.8rem;
  margin-top: 8px;
  color: #666;
`;

const SkillCost = styled.div`
  font-weight: bold;
  color: #ffd700;
  background: #333;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
  margin-top: 8px;
`;

const TargetSelection = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const TargetModal = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
`;

const TargetTitle = styled.h3`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
`;

const TargetGrid = styled.div`
  display: grid;
  gap: 15px;
`;

const TargetOption = styled.button`
  padding: 15px;
  border: 2px solid #667eea;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f0f7ff;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
  
  &.secondary {
    background: #f8f9fa;
    color: #333;
    border: 2px solid #e0e0e0;
    
    &:hover {
      background: #e9ecef;
    }
  }
`;

const GameResult = styled.div`
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  margin: 20px 0;
`;

const WinnerText = styled.h2`
  color: ${props => props.isWinner ? '#4caf50' : '#f44336'};
  font-size: 2rem;
  margin-bottom: 20px;
`;

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

function GameScreen({ socket, roomId, players, currentPlayer, gameFinished = false, onSubmitAnswer, onUseSkill, onLeaveGame }) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isActivePlayer, setIsActivePlayer] = useState(false);
  const [showTargetSelection, setShowTargetSelection] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  useEffect(() => {
    if (!socket) return;

    // Question events
    const handleNewQuestion = (data) => {
      setCurrentQuestion(data);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setIsActivePlayer(false);
    };

    const handleTimerUpdate = (data) => {
      setTimeLeft(data.timeLeft);
    };

    const handleAnswerResult = (data) => {
      setAnswerResult(data);
      if (data.playerId === currentPlayer?.id) {
        // Your answer result
        setIsActivePlayer(false);
      }
    };

    const handleNextTurn = (data) => {
      setIsActivePlayer(data.playerId === currentPlayer?.id);
    };

    // Game events
    const handleGameStarted = (data) => {
      setGameResult(null);
      setIsActivePlayer(data.currentTurn === currentPlayer?.id);
    };

    const handleGameEnded = (data) => {
      setGameResult(data);
      setIsActivePlayer(false);
    };

    // Skill events
    const handleSkillUsed = (data) => {
      // Skill used feedback
      console.log('Skill used:', data);
    };

    const handlePlayerEliminated = (data) => {
      console.log('Player eliminated:', data);
    };

    socket.on('new_question', handleNewQuestion);
    socket.on('timer_update', handleTimerUpdate);
    socket.on('answer_result', handleAnswerResult);
    socket.on('next_turn', handleNextTurn);
    socket.on('game_started', handleGameStarted);
    socket.on('game_ended', handleGameEnded);
    socket.on('skill_used', handleSkillUsed);
    socket.on('player_eliminated', handlePlayerEliminated);

    return () => {
      socket.off('new_question', handleNewQuestion);
      socket.off('timer_update', handleTimerUpdate);
      socket.off('answer_result', handleAnswerResult);
      socket.off('next_turn', handleNextTurn);
      socket.off('game_started', handleGameStarted);
      socket.off('game_ended', handleGameEnded);
      socket.off('skill_used', handleSkillUsed);
      socket.off('player_eliminated', handlePlayerEliminated);
    };
  }, [socket, currentPlayer]);

  const handleAnswerClick = (answerIndex) => {
    if (!isActivePlayer || selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    onSubmitAnswer(answerIndex);
  };

  const handleSkillUse = (skillType) => {
    const currentPlayerData = players.find(p => p.id === currentPlayer?.id);
    if (!currentPlayerData || currentPlayerData.skillPoints < SKILLS[skillType].cost) {
      return;
    }

    setSelectedSkill(skillType);
    
    if (skillType === 'TIME_BOMB') {
      // Time bomb doesn't need target selection
      onUseSkill(skillType, null);
      setSelectedSkill(null);
    } else {
      setShowTargetSelection(true);
    }
  };

  const handleTargetSelect = (targetId) => {
    if (selectedSkill) {
      onUseSkill(selectedSkill, targetId);
      setShowTargetSelection(false);
      setSelectedSkill(null);
    }
  };

  const handleCancelTargetSelection = () => {
    setShowTargetSelection(false);
    setSelectedSkill(null);
  };

  const progress = ((5 - timeLeft) / 5) * 360;

  if (gameFinished && gameResult) {
    const isWinner = gameResult.winner === currentPlayer?.name;
    
    return (
      <GameContainer>
        <Header>
          <GameTitle>🎯 Quiz Duel: Brain Battle</GameTitle>
        </Header>
        
        <GameResult>
          <WinnerText isWinner={isWinner}>
            {isWinner ? '🏆 You Won!' : `🏆 ${gameResult.winner} Won!`}
          </WinnerText>
          
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '20px' }}>
            Game Over! Thanks for playing!
          </p>
          
          <ActionButtons>
            <ActionButton className="primary" onClick={onLeaveGame}>
              Back to Lobby
            </ActionButton>
          </ActionButtons>
        </GameResult>
      </GameContainer>
    );
  }

  const currentPlayerData = players.find(p => p.id === currentPlayer?.id);

  return (
    <GameContainer>
      <Header>
        <GameTitle>🎯 Quiz Duel: Brain Battle</GameTitle>
      </Header>

      <PlayersGrid>
        {players.map((player) => (
          <PlayerCard 
            key={player.id}
            isCurrentPlayer={player.id === currentPlayer?.id}
            isActive={player.id === currentPlayer?.id && isActivePlayer}
          >
            <PlayerName>
              {player.name} {player.id === currentPlayer?.id ? '(You)' : ''}
            </PlayerName>
            <HealthBar>
              <HealthFill percentage={player.health} />
              <HealthText>{player.health}/100 HP</HealthText>
            </HealthBar>
            <SkillPoints>
              <SkillPointIcon>⚡</SkillPointIcon>
              <SkillPointCount>{player.skillPoints} SP</SkillPointCount>
            </SkillPoints>
          </PlayerCard>
        ))}
      </PlayersGrid>

      {currentQuestion && (
        <GameArea>
          <QuestionCategory>{currentQuestion.category}</QuestionCategory>
          <QuestionText>{currentQuestion.question}</QuestionText>
          
          <TimerContainer>
            <TimerCircle timeLeft={timeLeft} progress={progress}>
              <TimerText timeLeft={timeLeft}>{timeLeft}</TimerText>
            </TimerCircle>
          </TimerContainer>

          <AnswerGrid>
            {currentQuestion.options.map((option, index) => (
              <AnswerButton
                key={index}
                onClick={() => handleAnswerClick(index)}
                disabled={!isActivePlayer || selectedAnswer !== null}
                className={`${
                  selectedAnswer === index ? 'selected' : ''
                } ${
                  answerResult && answerResult.playerId === currentPlayer?.id
                    ? (answerResult.isCorrect ? 'correct' : 'incorrect')
                    : ''
                }`}
              >
                {option}
              </AnswerButton>
            ))}
          </AnswerGrid>
        </GameArea>
      )}

      {currentPlayerData && (
        <SkillPanel>
          <SkillTitle>⚔️ Skills (You: {currentPlayerData.skillPoints} SP)</SkillTitle>
          <SkillsGrid>
            {Object.entries(SKILLS).map(([skillType, skill]) => (
              <SkillButton
                key={skillType}
                available={currentPlayerData.skillPoints >= skill.cost}
                onClick={() => handleSkillUse(skillType)}
                disabled={currentPlayerData.skillPoints < skill.cost}
              >
                <div>{skill.name}</div>
                <SkillCost>{skill.cost} SP</SkillCost>
                <SkillDescription>{skill.description}</SkillDescription>
              </SkillButton>
            ))}
          </SkillsGrid>
        </SkillPanel>
      )}

      <ActionButtons>
        <ActionButton className="secondary" onClick={onLeaveGame}>
          Leave Game
        </ActionButton>
      </ActionButtons>

      {showTargetSelection && (
        <TargetSelection>
          <TargetModal>
            <TargetTitle>Select Target for {SKILLS[selectedSkill]?.name}</TargetTitle>
            <TargetGrid>
              {players
                .filter(player => player.id !== currentPlayer?.id && player.health > 0)
                .map(player => (
                  <TargetOption
                    key={player.id}
                    onClick={() => handleTargetSelect(player.id)}
                  >
                    <div style={{ fontWeight: 'bold' }}>{player.name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      {player.health} HP
                    </div>
                  </TargetOption>
                ))}
            </TargetGrid>
            <ActionButtons style={{ marginTop: '20px' }}>
              <ActionButton className="secondary" onClick={handleCancelTargetSelection}>
                Cancel
              </ActionButton>
            </ActionButtons>
          </TargetModal>
        </TargetSelection>
      )}
    </GameContainer>
  );
}

export default GameScreen;