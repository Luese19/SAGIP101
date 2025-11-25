import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const SkillsContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const SkillsHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const SkillsTitle = styled.h2`
  color: #333;
  font-size: 2rem;
  margin: 0 0 10px 0;
`;

const LevelInfo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const LevelBadge = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: bold;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const XPBar = styled.div`
  flex: 1;
  min-width: 200px;
  max-width: 300px;
`;

const XPText = styled.div`
  text-align: center;
  margin-bottom: 8px;
  color: #666;
  font-weight: 600;
`;

const XPProgress = styled.div`
  background: #e0e0e0;
  border-radius: 10px;
  height: 20px;
  overflow: hidden;
  position: relative;
`;

const XPFill = styled.div`
  background: linear-gradient(90deg, #4caf50 0%, #8bc34a 100%);
  height: 100%;
  width: ${props => props.percentage}%;
  border-radius: 10px;
  transition: width 0.3s ease;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
`;

const SkillCard = styled.div`
  background: ${props => props.unlocked ? 'white' : '#f5f5f5'};
  border: 2px solid ${props => props.unlocked ? '#667eea' : '#e0e0e0'};
  border-radius: 15px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;

  ${props => !props.unlocked && `
    opacity: 0.6;
    &::after {
      content: '🔒';
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 1.5rem;
    }
  `}
`;

const SkillHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
`;

const SkillIcon = styled.div`
  font-size: 2rem;
`;

const SkillInfo = styled.div`
  flex: 1;
`;

const SkillName = styled.h3`
  color: #333;
  margin: 0 0 5px 0;
  font-size: 1.2rem;
`;

const SkillLevel = styled.div`
  color: ${props => props.unlocked ? '#4caf50' : '#f44336'};
  font-weight: bold;
  font-size: 0.9rem;
`;

const SkillDescription = styled.p`
  color: #666;
  margin: 0 0 15px 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const SkillStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SkillCost = styled.div`
  background: #ffd700;
  color: #333;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.8rem;
`;

// Skills data (matches server)
const SKILLS = {
  DIRECT_SHOT: {
    name: "Direct Shot",
    cost: 20,
    damage: 15,
    description: "Deal 15 damage to one player",
    unlockLevel: 1,
    icon: "⚔️"
  },
  HEALTH_STEAL: {
    name: "Health Steal",
    cost: 30,
    damage: 10,
    description: "Steal 10 HP from opponent",
    unlockLevel: 2,
    icon: "🩸"
  },
  TIME_BOMB: {
    name: "Time Bomb",
    cost: 25,
    damage: 20,
    description: "20 damage if next player answers wrong",
    unlockLevel: 3,
    icon: "💣"
  },
  SHIELD: {
    name: "Shield",
    cost: 15,
    damage: 0,
    description: "Block next attack for 2 turns",
    unlockLevel: 4,
    icon: "🛡️",
    effect: "defensive"
  },
  KNOWLEDGE_BOOST: {
    name: "Knowledge Boost",
    cost: 25,
    damage: 0,
    description: "Double SP from next correct answer",
    unlockLevel: 5,
    icon: "📚",
    effect: "buff"
  },
  REGENERATION: {
    name: "Regeneration",
    cost: 20,
    damage: 0,
    description: "Heal 5 HP per turn for 3 turns",
    unlockLevel: 6,
    icon: "🌱",
    effect: "healing"
  },
  CONFUSION: {
    name: "Confusion",
    cost: 35,
    damage: 0,
    description: "Target answers wrong for 2 questions",
    unlockLevel: 7,
    icon: "🤯",
    effect: "debuff"
  },
  MIRROR: {
    name: "Mirror",
    cost: 40,
    damage: 0,
    description: "Reflect next skill used against you",
    unlockLevel: 8,
    icon: "🔄",
    effect: "reflect"
  }
};

function SkillsPanel({ playerData }) {
  const [levelXP, setLevelXP] = useState({ current: 0, next: 100 });

  useEffect(() => {
    if (playerData?.xp !== undefined && playerData?.level !== undefined) {
      const currentLevelXP = getXPForLevel(playerData.level);
      const nextLevelXP = getXPForLevel(playerData.level + 1);
      const currentXPInLevel = playerData.xp - currentLevelXP;
      const xpNeededForNext = nextLevelXP - currentLevelXP;

      setLevelXP({
        current: currentXPInLevel,
        next: xpNeededForNext
      });
    }
  }, [playerData]);

  const getXPForLevel = (level) => {
    const requirements = {
      1: 0, 2: 100, 3: 250, 4: 450, 5: 700,
      6: 1000, 7: 1350, 8: 1750, 9: 2200, 10: 2700
    };
    return requirements[level] || requirements[10];
  };

  const xpPercentage = levelXP.next > 0 ? (levelXP.current / levelXP.next) * 100 : 100;

  return (
    <SkillsContainer>
      <SkillsHeader>
        <SkillsTitle>⚔️ Your Skills</SkillsTitle>
      </SkillsHeader>

      <LevelInfo>
        <LevelBadge>
          🏆 Level {playerData?.level || 1}
        </LevelBadge>

        <XPBar>
          <XPText>
            XP: {levelXP.current} / {levelXP.next}
          </XPText>
          <XPProgress>
            <XPFill percentage={xpPercentage} />
          </XPProgress>
        </XPBar>
      </LevelInfo>

      <SkillsGrid>
        {Object.entries(SKILLS).map(([skillKey, skill]) => {
          const unlocked = playerData?.unlockedSkills?.includes(skillKey) ||
                          (playerData?.level >= skill.unlockLevel);

          return (
            <SkillCard key={skillKey} unlocked={unlocked}>
              <SkillHeader>
                <SkillIcon>{skill.icon}</SkillIcon>
                <SkillInfo>
                  <SkillName>{skill.name}</SkillName>
                  <SkillLevel unlocked={unlocked}>
                    {unlocked ? 'Unlocked' : `Unlocks at Level ${skill.unlockLevel}`}
                  </SkillLevel>
                </SkillInfo>
              </SkillHeader>

              <SkillDescription>{skill.description}</SkillDescription>

              <SkillStats>
                <div></div> {/* Spacer */}
                <SkillCost>{skill.cost} SP</SkillCost>
              </SkillStats>
            </SkillCard>
          );
        })}
      </SkillsGrid>
    </SkillsContainer>
  );
}

export default SkillsPanel;