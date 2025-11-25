import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import Profile from './Profile';
import SkillsPanel from './SkillsPanel';

const DashboardContainer = styled.div`
  min-height: 100vh;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const WelcomeSection = styled.div`
  flex: 1;
  min-width: 250px;
`;

const WelcomeTitle = styled.h1`
  color: white;
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 2rem;
    text-align: center;
  }
`;

const WelcomeSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 0;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;

  &.primary {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
    }
  }
  
  &.secondary {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
    }
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const QuickActionCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  }
`;

const ActionIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 15px;
`;

const ActionTitle = styled.h3`
  color: #333;
  margin: 0 0 10px 0;
  font-size: 1.3rem;
`;

const ActionDescription = styled.p`
  color: #666;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

function Dashboard({ onStartGame, onSignOut }) {
  const { userProfile } = useAuth();

  // Mock player data - in real implementation, this would come from server/player state
  const playerData = {
    level: 3,
    xp: 180,
    unlockedSkills: ['DIRECT_SHOT', 'HEALTH_STEAL', 'TIME_BOMB']
  };

  const handleCreateRoom = () => {
    window.location.href = '/lobby';
  };

  const handleJoinRoom = () => {
    window.location.href = '/lobby';
  };

  const handleViewProfile = () => {
    // Profile is already displayed at the top
    const profileElement = document.querySelector('.profile-section');
    if (profileElement) {
      profileElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <WelcomeSection>
          <WelcomeTitle>
            Welcome back, {userProfile?.displayName || 'Player'}! 🎮
          </WelcomeTitle>
          <WelcomeSubtitle>
            Ready to challenge your mind and compete with other players?
          </WelcomeSubtitle>
        </WelcomeSection>
        
        <ActionButtons>
          <ActionButton className="primary" onClick={handleCreateRoom}>
            🎯 Create Room
          </ActionButton>
          <ActionButton className="secondary" onClick={handleJoinRoom}>
            🚪 Join Room
          </ActionButton>
          <ActionButton className="secondary" onClick={onSignOut}>
            🚪 Sign Out
          </ActionButton>
        </ActionButtons>
      </DashboardHeader>

      {/* Profile Section */}
      <div className="profile-section">
        <Profile />
      </div>

      {/* Skills Panel */}
      <SkillsPanel playerData={playerData} />

      {/* Quick Actions */}
      <QuickActions>
        <QuickActionCard onClick={handleCreateRoom}>
          <ActionIcon>🎯</ActionIcon>
          <ActionTitle>Create New Game</ActionTitle>
          <ActionDescription>
            Start a new quiz game and invite friends to compete
          </ActionDescription>
        </QuickActionCard>

        <QuickActionCard onClick={handleJoinRoom}>
          <ActionIcon>👥</ActionIcon>
          <ActionTitle>Join Existing Game</ActionTitle>
          <ActionDescription>
            Enter a room code to join an ongoing game
          </ActionDescription>
        </QuickActionCard>

        <QuickActionCard onClick={handleViewProfile}>
          <ActionIcon>🏆</ActionIcon>
          <ActionTitle>Your Stats</ActionTitle>
          <ActionDescription>
            View your achievements, win rate, and skill points
          </ActionDescription>
        </QuickActionCard>
      </QuickActions>
    </DashboardContainer>
  );
}

export default Dashboard;