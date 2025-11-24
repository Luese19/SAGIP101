import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import SocketService from '../services/SocketService';

const RoomWaitingScreen = ({ navigation, route }) => {
  const { currentUser, userProfile } = useAuth();
  const [roomId, setRoomId] = useState(route.params?.roomId || '');
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [gameStarting, setGameStarting] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    // Socket listeners
    SocketService.on('room_joined', (data) => {
      setPlayers(data.players || []);
      setCurrentPlayer(data.player);
      if (data.player?.ready) {
        setIsReady(true);
      }
    });

    SocketService.on('room_players', (data) => {
      setPlayers(data.players || []);
    });

    SocketService.on('player_joined', (data) => {
      setPlayers(prev => [...prev, data.player]);
    });

    SocketService.on('player_left', (data) => {
      setPlayers(data.players || []);
    });

    SocketService.on('players_updated', (data) => {
      setPlayers(data.players || []);
    });

    SocketService.on('player_ready', (data) => {
      setPlayers(data.players || []);
      if (data.player?.uid === currentUser?.uid) {
        setIsReady(true);
      }
    });

    SocketService.on('game_started', (data) => {
      setGameStarting(true);
      setTimeout(() => {
        navigation.navigate('Game', { roomId: roomId, players: data.players });
      }, 2000);
    });

    return () => {
      SocketService.off('room_joined');
      SocketService.off('room_players');
      SocketService.off('player_joined');
      SocketService.off('player_left');
      SocketService.off('players_updated');
      SocketService.off('player_ready');
      SocketService.off('game_started');
    };
  }, [roomId, currentUser, navigation]);

  const handleSetReady = () => {
    SocketService.setPlayerReady();
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      'Leave Room',
      'Are you sure you want to leave the room?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: () => {
            SocketService.leaveRoom();
            navigation.goBack();
          }
        }
      ]
    );
  };

  const PlayerCard = ({ player, isCurrentUser, isHost }) => (
    <View style={[styles.playerCard, isCurrentUser && styles.currentPlayerCard]}>
      <View style={styles.playerInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {(player.displayName || 'P').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.playerDetails}>
          <View style={styles.playerNameContainer}>
            <Text style={styles.playerName}>
              {player.displayName || 'Player'}
              {isCurrentUser && ' (You)'}
            </Text>
            {isHost && <Text style={styles.hostBadge}>👑 Host</Text>}
          </View>
          <Text style={styles.playerStatus}>
            {player.ready ? '✅ Ready' : '⏳ Waiting'}
          </Text>
        </View>
      </View>
    </View>
  );

  const getRoomStats = () => {
    const readyPlayers = players.filter(p => p.ready).length;
    return { total: players.length, ready: readyPlayers };
  };

  const { total, ready } = getRoomStats();

  if (gameStarting) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centeredContent}>
            <Text style={styles.gameStartingIcon}>🎮</Text>
            <Text style={styles.gameStartingTitle}>Game Starting!</Text>
            <Text style={styles.gameStartingText}>
              All players are ready. Get ready to battle!
            </Text>
            <View style={styles.loadingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.logo}>🎯</Text>
            <Text style={styles.title}>Room Waiting</Text>
            <Text style={styles.roomId}>Room ID: {roomId}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{total}</Text>
              <Text style={styles.statLabel}>Players</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{ready}</Text>
              <Text style={styles.statLabel}>Ready</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {total > 0 ? Math.round((ready / total) * 100) : 0}%
              </Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </View>

          <View style={styles.playersSection}>
            <Text style={styles.sectionTitle}>Players ({total})</Text>
            <ScrollView style={styles.playersList} showsVerticalScrollIndicator={false}>
              {players.map((player, index) => (
                <PlayerCard
                  key={player.uid || index}
                  player={player}
                  isCurrentUser={player.uid === currentUser?.uid}
                  isHost={index === 0} // First player is typically the host
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.readyButton, isReady && styles.readyButtonActive]}
              onPress={handleSetReady}
              disabled={isReady}
            >
              <Text style={styles.readyButtonText}>
                {isReady ? '✅ Ready!' : 'Click When Ready'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.leaveButton}
              onPress={handleLeaveRoom}
            >
              <Text style={styles.leaveButtonText}>Leave Room</Text>
            </TouchableOpacity>
          </View>

          {total < 2 && (
            <View style={styles.waitingMessage}>
              <Text style={styles.waitingText}>
                👥 Waiting for more players to join...
              </Text>
              <Text style={styles.waitingSubtext}>
                You need at least 2 players to start a game
              </Text>
            </View>
          )}
        </ScrollView>
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
    flexGrow: 1,
    padding: 20,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameStartingIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  gameStartingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  gameStartingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    marginHorizontal: 5,
  },
  dot1: {
    animationDelay: '0ms',
  },
  dot2: {
    animationDelay: '150ms',
  },
  dot3: {
    animationDelay: '300ms',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 48,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  roomId: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  playersSection: {
    flex: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  playersList: {
    maxHeight: 300,
  },
  playerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currentPlayerCard: {
    borderColor: '#667eea',
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  playerDetails: {
    flex: 1,
  },
  playerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  hostBadge: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: '600',
  },
  playerStatus: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    marginBottom: 20,
  },
  readyButton: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  readyButtonActive: {
    backgroundColor: '#2e7d32',
  },
  readyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  leaveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  waitingMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  waitingText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  waitingSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default RoomWaitingScreen;