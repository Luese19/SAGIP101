import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const API_BASE_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

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
  max-width: 900px;
  width: 100%;
  text-align: center;
  animation: slideUp 0.6s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
  font-size: 2.8rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 30px;
  font-size: 1.2rem;
`;

const UserInfo = styled.div`
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
  color: #333;
  font-weight: 600;
  border: 2px solid #667eea;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 30px;
  background: #f8f9fa;
  border-radius: 15px;
  padding: 4px;
  gap: 4px;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 15px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' : '#e9ecef'};
  }
`;

const CreateRoomSection = styled.div`
  margin-bottom: 30px;
`;

const RoomOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
`;

const OptionCard = styled.div`
  background: #f8f9fa;
  border: 2px solid ${props => props.selected ? '#667eea' : '#e0e0e0'};
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;

  &:hover {
    border-color: #667eea;
    background: #f0f7ff;
  }
`;

const OptionTitle = styled.h4`
  color: #333;
  margin-bottom: 8px;
  font-size: 1.1rem;
`;

const OptionDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const RoomNameInput = styled.input`
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

const SectionTitle = styled.h4`
  color: #333;
  margin-bottom: 15px;
  font-size: 1.2rem;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 20px 0;
`;

const CategoryCard = styled.div`
  background: ${props => props.selected ? 
    `linear-gradient(135deg, ${props.color}20 0%, ${props.color}40 100%)` : 
    '#f8f9fa'};
  border: 2px solid ${props => props.selected ? props.color : '#e0e0e0'};
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    border-color: ${props => props.color};
    background: ${props => props.selected ? 
      `linear-gradient(135deg, ${props.color}30 0%, ${props.color}50 100%)` : 
      `${props.color}10`};
    transform: translateY(-2px);
  }
`;

const CategoryIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 10px;
`;

const CategoryName = styled.h5`
  color: #333;
  margin-bottom: 8px;
  font-size: 1rem;
`;

const CategoryDescription = styled.p`
  color: #666;
  font-size: 0.85rem;
  line-height: 1.3;
`;

const RoomsSection = styled.div`
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #e0e0e0;
`;

const RoomsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
`;

const RoomCard = styled.div`
  background: #f8f9fa;
  border: 2px solid ${props => props.selected ? '#667eea' : '#e0e0e0'};
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  position: relative;

  &:hover {
    border-color: #667eea;
    background: #f0f7ff;
    transform: translateY(-2px);
  }
`;

const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const RoomName = styled.h4`
  color: #333;
  margin: 0;
  font-size: 1.1rem;
`;

const RoomMode = styled.span`
  background: ${props => {
    switch(props.mode) {
      case 'CLASSIC': return '#e3f2fd';
      case 'RAPID': return '#fff3e0';
      case 'SURVIVAL': return '#fce4ec';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch(props.mode) {
      case 'CLASSIC': return '#1976d2';
      case 'RAPID': return '#f57c00';
      case 'SURVIVAL': return '#c2185b';
      default: return '#666';
    }
  }};
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const RoomCategory = styled.div`
  background: ${props => props.color || '#f5f5f5'};
  color: ${props => props.textColor || '#666'};
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 8px;
`;

const RoomInfo = styled.div`
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
`;

const RoomHost = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const TeamModeIndicator = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: ${props => props.isTeamMode ? '#4caf50' : '#ff9800'};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
`;

const AutoStartIndicator = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: #2196f3;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
`;

const RefreshButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;

  &:hover {
    background: #5a6fd8;
    transform: translateY(-1px);
  }
`;

const JoinSection = styled.div`
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #e0e0e0;
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
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button`
  padding: 15px 30px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
  
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
  
  &.home {
    background: #4caf50;
    color: white;
    margin-top: 15px;
    
    &:hover {
      background: #45a049;
      transform: translateY(-2px);
    }
  }
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  color: #c62828;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  border: 1px solid #f44336;
`;

const SuccessMessage = styled.div`
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  color: #2e7d32;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  border: 1px solid #4caf50;
`;

const StatsPreview = styled.div`
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-radius: 15px;
  padding: 20px;
  margin-top: 20px;
  border: 1px solid #ff9800;
`;

const StatsTitle = styled.h4`
  color: #e65100;
  margin-bottom: 15px;
  font-size: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #e65100;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

// Game modes and categories data
const GAME_MODES = {
  CLASSIC: {
    title: "Classic Battle",
    description: "Answer questions, earn points, attack opponents. Classic quiz duel experience.",
    features: ["5-second timer", "All skill types available", "Full HP system"],
    maxPlayers: 4,
    isTeamMode: false
  },
  RAPID: {
    title: "Rapid Fire",
    description: "Fast-paced questions with shorter timer. Quick thinking required!",
    features: ["3-second timer", "Faster gameplay", "Bonus points for speed"],
    maxPlayers: 4,
    isTeamMode: false
  },
  SURVIVAL: {
    title: "Survival Mode",
    description: "One life, one chance. Answer correctly or face elimination!",
    features: ["No health system", "Elimination style", "Highest stakes"],
    maxPlayers: 4,
    isTeamMode: false
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

function Lobby({ onCreateRoom, onJoinRoom, onGetRooms, connectionError, isConnected, userName, userStats }) {
  const [activeTab, setActiveTab] = useState('create');
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [gameMode, setGameMode] = useState('CLASSIC');
  const [category, setCategory] = useState('GENERAL');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Load available rooms on component mount
  useEffect(() => {
    loadAvailableRooms();
  }, []);

  // Update max players when game mode changes
  useEffect(() => {
    const selectedMode = GAME_MODES[gameMode];
    if (selectedMode) {
      setMaxPlayers(selectedMode.maxPlayers);
    }
  }, [gameMode]);

  const loadAvailableRooms = async () => {
    setLoadingRooms(true);
    try {
      // Primary: Try HTTP fetch
      const response = await fetch(`${API_BASE_URL}/rooms`);
      const data = await response.json();
      setAvailableRooms(data.rooms || []);
    } catch (error) {
      console.error('Error loading rooms via HTTP:', error);
      // Fallback: try socket if HTTP fails
      if (onGetRooms) {
        onGetRooms();
      }
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleCreateRoom = () => {
    setError('');
    setSuccess('');

    if (!roomName.trim()) {
      setError('Please enter a room name');
      return;
    }

    if (!category) {
      setError('Please select a category before creating the room');
      return;
    }

    const selectedMode = GAME_MODES[gameMode];
    if (!selectedMode) {
      setError('Please select a valid game mode');
      return;
    }

    const roomData = {
      name: roomName.trim(),
      gameMode,
      category,
      maxPlayers,
      hostName: userName
    };

    onCreateRoom(roomData);
    setSuccess(`Creating ${selectedMode.isTeamMode ? 'team' : 'individual'} room...`);
  };

  const handleJoinRoom = () => {
    setError('');
    setSuccess('');
    
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }
    
    onJoinRoom(roomId.trim().toUpperCase(), userName);
    setSuccess('Joining room...');
  };

  const handleJoinFromList = (room) => {
    setError('');
    onJoinRoom(room.id, userName);
    setSuccess(`Joining "${room.name}"...`);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getGameModeInfo = (mode) => {
    return GAME_MODES[mode] || { title: mode, description: '' };
  };

  const getCategoryInfo = (catKey) => {
    return CATEGORIES[catKey] || { name: catKey, icon: '❓', color: '#666', description: '' };
  };

  return (
    <LobbyContainer>
      <LobbyCard>
        <Title>🎯 Quiz Duel</Title>
        <Subtitle>Multiplayer Brain Battle Arena</Subtitle>
        
        <UserInfo>
          Welcome back, <strong>{userName}</strong>! 👋
        </UserInfo>
        
        {connectionError && (
          <ErrorMessage>{connectionError}</ErrorMessage>
        )}

        {!isConnected && !connectionError && (
          <ErrorMessage>Connecting to server...</ErrorMessage>
        )}
        
        {error && (
          <ErrorMessage>{error}</ErrorMessage>
        )}
        
        {success && (
          <SuccessMessage>{success}</SuccessMessage>
        )}
        
        <TabContainer>
          <TabButton 
            active={activeTab === 'create'} 
            onClick={() => setActiveTab('create')}
          >
            🎮 Create Room
          </TabButton>
          <TabButton 
            active={activeTab === 'discover'} 
            onClick={() => setActiveTab('discover')}
          >
            🔍 Discover Rooms
          </TabButton>
          <TabButton 
            active={activeTab === 'join'} 
            onClick={() => setActiveTab('join')}
          >
            🔗 Join Room
          </TabButton>
        </TabContainer>
        
        {activeTab === 'create' && (
          <CreateRoomSection>
            <h3 style={{ color: '#333', marginBottom: '20px' }}>Create New Room</h3>
            
            <RoomNameInput
              type="text"
              placeholder="Enter room name (e.g., 'Friday Quiz Night')"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={50}
            />
            
            <SectionTitle>Choose Game Mode</SectionTitle>
            
            <RoomOptions>
              {Object.entries(GAME_MODES).map(([modeKey, mode]) => (
                <OptionCard
                  key={modeKey}
                  selected={gameMode === modeKey}
                  onClick={() => setGameMode(modeKey)}
                >
                  <OptionTitle>{mode.title}</OptionTitle>
                  <OptionDescription>{mode.description}</OptionDescription>
                  <div style={{ marginTop: '10px' }}>
                    {mode.features.map((feature, index) => (
                      <div key={index} style={{ fontSize: '0.8rem', color: '#4caf50', marginTop: '5px' }}>
                        ✓ {feature}
                      </div>
                    ))}
                  </div>
                </OptionCard>
              ))}
            </RoomOptions>
            
            <SectionTitle>Choose Question Category</SectionTitle>

            <CategoryGrid>
              {Object.entries(CATEGORIES).map(([catKey, cat]) => (
                <CategoryCard
                  key={catKey}
                  selected={category === catKey}
                  color={cat.color}
                  onClick={() => setCategory(catKey)}
                >
                  <CategoryIcon>{cat.icon}</CategoryIcon>
                  <CategoryName>{cat.name}</CategoryName>
                  <CategoryDescription>{cat.description}</CategoryDescription>
                </CategoryCard>
              ))}
            </CategoryGrid>

            <SectionTitle>Maximum Players (2-8)</SectionTitle>
            <div style={{ margin: '20px 0', textAlign: 'center' }}>
              <select
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: '2px solid #e0e0e0',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: 'white',
                  cursor: 'pointer',
                  minWidth: '120px'
                }}
              >
                {Array.from({ length: 7 }, (_, i) => i + 2).map(num => (
                  <option key={num} value={num}>
                    {num} Players
                  </option>
                ))}
              </select>
              {GAME_MODES[gameMode]?.isTeamMode && maxPlayers % 2 !== 0 && (
                <div style={{
                  color: '#ff9800',
                  fontSize: '14px',
                  marginTop: '8px',
                  fontWeight: '500'
                }}>
                  ⚠️ Uneven teams may cause imbalance
                </div>
              )}
            </div>
            
            <ButtonGroup>
              <Button
                className="primary"
                onClick={handleCreateRoom}
                disabled={!!connectionError || !isConnected || !roomName.trim()}
              >
                🚀 Create Room ({getGameModeInfo(gameMode).title} - {getCategoryInfo(category).name})
              </Button>
              <Button className="secondary" onClick={() => {
                setRoomName('');
                setGameMode('CLASSIC');
                setCategory('GENERAL');
                setError('');
                setSuccess('');
              }}>
                🔄 Reset
              </Button>
            </ButtonGroup>
          </CreateRoomSection>
        )}
        
        {activeTab === 'discover' && (
          <RoomsSection>
            <h3 style={{ color: '#333', marginBottom: '20px' }}>Available Rooms</h3>
            
            <RefreshButton onClick={loadAvailableRooms} disabled={loadingRooms}>
              {loadingRooms ? '🔄 Loading...' : '🔄 Refresh'}
            </RefreshButton>
            
            {availableRooms.length === 0 ? (
              <div style={{ color: '#666', fontStyle: 'italic', padding: '20px' }}>
                {loadingRooms ? 'Loading rooms...' : 'No available rooms. Create one!'}
              </div>
            ) : (
              <RoomsGrid>
                {availableRooms.map((room) => {
                  const categoryInfo = getCategoryInfo(room.category);
                  const gameModeInfo = GAME_MODES[room.gameMode] || { isTeamMode: false };
                  return (
                    <RoomCard
                      key={room.id}
                      onClick={() => isConnected ? handleJoinFromList(room) : null}
                      style={{ opacity: isConnected ? 1 : 0.5, cursor: isConnected ? 'pointer' : 'not-allowed' }}
                    >
                      <TeamModeIndicator isTeamMode={gameModeInfo.isTeamMode}>
                        {gameModeInfo.isTeamMode ? 'Teams' : 'Solo'}
                      </TeamModeIndicator>
                      {gameModeInfo.isTeamMode && (
                        <AutoStartIndicator>
                          Auto-start
                        </AutoStartIndicator>
                      )}
                      <RoomHeader>
                        <RoomName>{room.name}</RoomName>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <RoomMode mode={room.gameMode}>
                            {getGameModeInfo(room.gameMode).title}
                          </RoomMode>
                          <RoomCategory color={categoryInfo.color}>
                            {categoryInfo.icon} {categoryInfo.name}
                          </RoomCategory>
                        </div>
                      </RoomHeader>
                      <RoomInfo>
                        <span>👥 {room.players}/{room.maxPlayers}{room.customMaxPlayers ? '*' : ''}</span>
                        <span>🕐 {formatTimeAgo(room.createdAt)}</span>
                      </RoomInfo>
                      <RoomHost>👑 Host: {room.host}</RoomHost>
                    </RoomCard>
                  );
                })}
              </RoomsGrid>
            )}
          </RoomsSection>
        )}
        
        {activeTab === 'join' && (
          <JoinSection>
            <h3 style={{ color: '#333', marginBottom: '20px' }}>Join Existing Room</h3>
            
            <Input
              type="text"
              placeholder="Enter Room ID (e.g., ABC123)"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleJoinRoom();
                }
              }}
              maxLength={10}
            />
            
            <ButtonGroup>
              <Button
                className="primary"
                onClick={handleJoinRoom}
                disabled={!roomId.trim() || !!connectionError || !isConnected}
              >
                🔗 Join Room
              </Button>
            </ButtonGroup>
          </JoinSection>
        )}
        
        <Button className="home" onClick={() => window.location.href = '/dashboard'}>
          🏠 Back to Dashboard
        </Button>
        
        {userStats && (
          <StatsPreview>
            <StatsTitle>📊 Your Quiz Stats</StatsTitle>
            <StatsGrid>
              <StatItem>
                <StatValue>{userStats.gamesPlayed || 0}</StatValue>
                <StatLabel>Games Played</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{userStats.gamesWon || 0}</StatValue>
                <StatLabel>Games Won</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{Math.round(((userStats.gamesWon || 0) / Math.max(userStats.gamesPlayed || 1, 1)) * 100)}%</StatValue>
                <StatLabel>Win Rate</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{userStats.totalSkillPoints || 0}</StatValue>
                <StatLabel>Total Points</StatLabel>
              </StatItem>
            </StatsGrid>
          </StatsPreview>
        )}
      </LobbyCard>
    </LobbyContainer>
  );
}

export default Lobby;