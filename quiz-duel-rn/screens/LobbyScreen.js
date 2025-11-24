import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  FlatList,
  RefreshControl,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import SocketService from '../services/SocketService';

const LobbyScreen = ({ navigation, route }) => {
  const { userProfile, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(route.params?.initialTab || 'create');
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [gameMode, setGameMode] = useState('CLASSIC');
  const [category, setCategory] = useState('GENERAL');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Game modes and categories data
  const GAME_MODES = {
    CLASSIC: {
      title: "Classic Battle",
      description: "Answer questions, earn points, attack opponents.",
      features: ["5-second timer", "All skill types", "Full HP system"]
    },
    RAPID: {
      title: "Rapid Fire",
      description: "Fast-paced with shorter timer.",
      features: ["3-second timer", "Faster gameplay", "Bonus points"]
    },
    SURVIVAL: {
      title: "Survival Mode",
      description: "One life, one chance to survive!",
      features: ["No health system", "Elimination style", "Highest stakes"]
    }
  };

  const CATEGORIES = {
    GENERAL: { name: "General", icon: "🧠", color: "#8BC34A" },
    GEOGRAPHY: { name: "Geography", icon: "🌍", color: "#4CAF50" },
    SCIENCE: { name: "Science", icon: "🔬", color: "#2196F3" },
    HISTORY: { name: "History", icon: "📜", color: "#FF9800" },
    SPORTS: { name: "Sports", icon: "⚽", color: "#9C27B0" },
    ENTERTAINMENT: { name: "Entertainment", icon: "🎬", color: "#E91E63" },
    TECHNOLOGY: { name: "Technology", icon: "💻", color: "#607D8B" },
    PROGRAMMING: { name: "Programming", icon: "⚡", color: "#FF6B35" },
    MATHEMATICS: { name: "Mathematics", icon: "🧮", color: "#009688" },
    MUSIC: { name: "Music", icon: "🎵", color: "#FF5722" }
  };

  useEffect(() => {
    if (activeTab === 'discover') {
      loadAvailableRooms();
    }

    // Socket listeners
    SocketService.on('room_created', (data) => {
      setSuccess('Room created! Joining...');
      navigation.navigate('RoomWaiting', { roomId: data.roomId });
    });

    SocketService.on('room_joined', (data) => {
      setSuccess('Joined room! Entering...');
      navigation.navigate('RoomWaiting', { roomId: data.roomId });
    });

    SocketService.on('room_list', (data) => {
      setAvailableRooms(data.rooms || []);
    });

    SocketService.on('error_message', (data) => {
      setError(data.message);
    });

    return () => {
      SocketService.off('room_created');
      SocketService.off('room_joined');
      SocketService.off('room_list');
      SocketService.off('error_message');
    };
  }, [activeTab, navigation]);

  const loadAvailableRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      if (SocketService.isConnected()) {
        SocketService.getRooms();
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoadingRooms(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAvailableRooms();
  }, [loadAvailableRooms]);

  const handleCreateRoom = () => {
    setError('');
    setSuccess('');
    
    if (!roomName.trim()) {
      setError('Please enter a room name');
      return;
    }
    
    if (!category) {
      setError('Please select a category');
      return;
    }
    
    const roomData = {
      name: roomName.trim(),
      gameMode,
      category,
      hostName: userProfile?.displayName || 'Player',
      uid: currentUser?.uid
    };
    
    SocketService.createRoom(roomData);
    setSuccess('Creating room...');
  };

  const handleJoinRoom = () => {
    setError('');
    setSuccess('');
    
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }
    
    SocketService.joinRoom(roomId.trim().toUpperCase(), userProfile?.displayName || 'Player');
    setSuccess('Joining room...');
  };

  const handleJoinFromList = (room) => {
    setError('');
    SocketService.joinRoom(room.id, userProfile?.displayName || 'Player');
    setSuccess(`Joining "${room.name}"...`);
  };

  const TabButton = ({ label, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>{label}</Text>
    </TouchableOpacity>
  );

  const OptionCard = ({ title, description, features, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.optionCard, selected && styles.selectedCard]}
      onPress={onPress}
    >
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionDescription}>{description}</Text>
      {features?.map((feature, index) => (
        <Text key={index} style={styles.featureText}>✓ {feature}</Text>
      ))}
    </TouchableOpacity>
  );

  const CategoryCard = ({ name, icon, color, selected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        { borderColor: color },
        selected && { backgroundColor: `${color}20` }
      ]}
      onPress={onPress}
    >
      <Text style={styles.categoryIcon}>{icon}</Text>
      <Text style={styles.categoryName}>{name}</Text>
    </TouchableOpacity>
  );

  const RoomCard = ({ room }) => {
    const categoryInfo = CATEGORIES[room.category] || CATEGORIES.GENERAL;
    return (
      <TouchableOpacity
        style={styles.roomCard}
        onPress={() => handleJoinFromList(room)}
      >
        <View style={styles.roomHeader}>
          <Text style={styles.roomName}>{room.name}</Text>
          <View style={styles.roomBadges}>
            <View style={styles.gameModeBadge}>
              <Text style={styles.badgeText}>{GAME_MODES[room.gameMode]?.title || room.gameMode}</Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color }]}>
              <Text style={styles.badgeText}>{categoryInfo.icon} {categoryInfo.name}</Text>
            </View>
          </View>
        </View>
        <View style={styles.roomInfo}>
          <Text style={styles.roomPlayers}>👥 {room.players}/{room.maxPlayers}</Text>
          <Text style={styles.roomHost}>👑 {room.host}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.logo}>🎯</Text>
            <Text style={styles.title}>Quiz Duel</Text>
            <Text style={styles.subtitle}>Lobby</Text>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          <View style={styles.tabContainer}>
            <TabButton 
              label="🎮 Create" 
              isActive={activeTab === 'create'} 
              onPress={() => setActiveTab('create')} 
            />
            <TabButton 
              label="🔍 Discover" 
              isActive={activeTab === 'discover'} 
              onPress={() => setActiveTab('discover')} 
            />
            <TabButton 
              label="🔗 Join" 
              isActive={activeTab === 'join'} 
              onPress={() => setActiveTab('join')} 
            />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {activeTab === 'create' && (
              <View style={styles.createSection}>
                <Text style={styles.sectionTitle}>Create New Room</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Room name (e.g., 'Friday Quiz Night')"
                  placeholderTextColor="#999"
                  value={roomName}
                  onChangeText={setRoomName}
                  maxLength={50}
                />

                <Text style={styles.sectionLabel}>Game Mode</Text>
                <View style={styles.optionsGrid}>
                  {Object.entries(GAME_MODES).map(([modeKey, mode]) => (
                    <OptionCard
                      key={modeKey}
                      title={mode.title}
                      description={mode.description}
                      features={mode.features}
                      selected={gameMode === modeKey}
                      onPress={() => setGameMode(modeKey)}
                    />
                  ))}
                </View>

                <Text style={styles.sectionLabel}>Category</Text>
                <View style={styles.categoriesGrid}>
                  {Object.entries(CATEGORIES).map(([catKey, cat]) => (
                    <CategoryCard
                      key={catKey}
                      name={cat.name}
                      icon={cat.icon}
                      color={cat.color}
                      selected={category === catKey}
                      onPress={() => setCategory(catKey)}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, styles.createButton]}
                  onPress={handleCreateRoom}
                >
                  <Text style={styles.actionButtonText}>
                    🚀 Create Room ({GAME_MODES[gameMode].title})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    setRoomName('');
                    setGameMode('CLASSIC');
                    setCategory('GENERAL');
                    setError('');
                    setSuccess('');
                  }}
                >
                  <Text style={styles.resetButtonText}>🔄 Reset</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'discover' && (
              <View style={styles.discoverSection}>
                <Text style={styles.sectionTitle}>Available Rooms</Text>
                
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={loadAvailableRooms}
                  disabled={loadingRooms}
                >
                  <Text style={styles.refreshButtonText}>
                    {loadingRooms ? '🔄 Loading...' : '🔄 Refresh'}
                  </Text>
                </TouchableOpacity>

                <FlatList
                  data={availableRooms}
                  renderItem={({ item }) => <RoomCard room={item} />}
                  keyExtractor={(item) => item.id}
                  style={styles.roomsList}
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  }
                  ListEmptyComponent={
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyText}>
                        {loadingRooms ? 'Loading rooms...' : 'No available rooms. Create one!'}
                      </Text>
                    </View>
                  }
                />
              </View>
            )}

            {activeTab === 'join' && (
              <View style={styles.joinSection}>
                <Text style={styles.sectionTitle}>Join Existing Room</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Enter Room ID (e.g., ABC123)"
                  placeholderTextColor="#999"
                  value={roomId}
                  onChangeText={setRoomId}
                  autoCapitalize="characters"
                  maxLength={10}
                />

                <TouchableOpacity
                  style={[styles.actionButton, styles.joinButton]}
                  onPress={handleJoinRoom}
                >
                  <Text style={styles.actionButtonText}>🔗 Join Room</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>🏠 Back to Dashboard</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logo: {
    fontSize: 48,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  errorBanner: {
    backgroundColor: '#ff4757',
    margin: 20,
    marginBottom: 0,
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  successBanner: {
    backgroundColor: '#2ed573',
    margin: 20,
    marginBottom: 0,
    padding: 10,
    borderRadius: 8,
  },
  successText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 21,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: 'white',
  },
  tabText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#667eea',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  optionsGrid: {
    marginBottom: 15,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#667eea',
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#4caf50',
    marginTop: 2,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  actionButton: {
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  createButton: {
    backgroundColor: '#667eea',
  },
  joinButton: {
    backgroundColor: '#4ecdc4',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  roomsList: {
    maxHeight: 400,
  },
  roomCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  roomHeader: {
    marginBottom: 10,
  },
  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  roomBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  gameModeBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  roomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roomPlayers: {
    fontSize: 14,
    color: '#666',
  },
  roomHost: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LobbyScreen;