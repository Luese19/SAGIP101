import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import SocketService from '../services/SocketService';

const DashboardScreen = ({ navigation }) => {
  const { currentUser, userProfile, logout, updateUserStats } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [gameState, setGameState] = useState('dashboard'); // dashboard, lobby, waiting, playing
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    // Initialize socket connection
    if (currentUser) {
      const socket = SocketService.connect(currentUser.uid, userProfile?.displayName || 'Player');
      
      // Listen for connection errors
      SocketService.on('error_message', (data) => {
        setConnectionError(data.message);
      });

      SocketService.on('connect', () => {
        setConnectionError('');
        SocketService.getRooms();
      });

      return () => {
        SocketService.disconnect();
      };
    }
  }, [currentUser, userProfile]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      if (SocketService.isConnected()) {
        SocketService.getRooms();
      }
    }, 1000);
  }, []);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            SocketService.disconnect();
          }
        }
      ]
    );
  };

  const handleCreateRoom = () => {
    navigation.navigate('Lobby', { initialTab: 'create' });
  };

  const handleJoinRoom = () => {
    navigation.navigate('Lobby', { initialTab: 'discover' });
  };

  const QuickActionCard = ({ icon, title, description, onPress, gradient }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <LinearGradient
        colors={gradient}
        style={styles.quickActionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.quickActionIcon}>{icon}</Text>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionDescription}>{description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const ProfileCard = () => (
    <LinearGradient
      colors={['#ffffff', '#f0f7ff']}
      style={styles.profileCard}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {(userProfile?.displayName || 'P').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userProfile?.displayName || 'Player'}</Text>
          <Text style={styles.profileEmail}>{currentUser?.email}</Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userProfile?.stats?.gamesPlayed || 0}</Text>
          <Text style={styles.statLabel}>Games</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userProfile?.stats?.gamesWon || 0}</Text>
          <Text style={styles.statLabel}>Won</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {userProfile?.stats?.gamesPlayed > 0 
              ? Math.round((userProfile.stats.gamesWon / userProfile.stats.gamesPlayed) * 100)
              : 0}%
          </Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userProfile?.stats?.totalSkillPoints || 0}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {connectionError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{connectionError}</Text>
            </View>
          ) : null}

          <View style={styles.header}>
            <Text style={styles.welcomeTitle}>
              Welcome back, {userProfile?.displayName || 'Player'}! 🎮
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Ready to challenge your mind?
            </Text>
          </View>

          <ProfileCard />

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.mainButton, styles.createButton]}
              onPress={handleCreateRoom}
            >
              <LinearGradient
                colors={['#ff6b6b', '#ee5a52']}
                style={styles.buttonGradient}
              >
                <Text style={styles.mainButtonIcon}>🎯</Text>
                <Text style={styles.mainButtonText}>Create Room</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mainButton, styles.joinButton]}
              onPress={handleJoinRoom}
            >
              <LinearGradient
                colors={['#4ecdc4', '#44a08d']}
                style={styles.buttonGradient}
              >
                <Text style={styles.mainButtonIcon}>🚪</Text>
                <Text style={styles.mainButtonText}>Join Room</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <QuickActionCard
              icon="🎯"
              title="Create New Game"
              description="Start a quiz battle"
              onPress={handleCreateRoom}
              gradient={['#ff6b6b', '#ee5a52']}
            />
            
            <QuickActionCard
              icon="👥"
              title="Join Existing"
              description="Enter a room to play"
              onPress={handleJoinRoom}
              gradient={['#4ecdc4', '#44a08d']}
            />
            
            <QuickActionCard
              icon="🏆"
              title="View Stats"
              description="Your achievements"
              onPress={() => {/* Navigate to stats screen */}}
              gradient={['#a8edea', '#fed6e3']}
            />
          </View>

          <TouchableOpacity
            style={[styles.signOutButton]}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
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
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  errorBanner: {
    backgroundColor: '#ff4757',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  header: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ddd',
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 15,
  },
  mainButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonGradient: {
    padding: 20,
    alignItems: 'center',
  },
  mainButtonIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  mainButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  quickActions: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  quickActionCard: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  quickActionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;