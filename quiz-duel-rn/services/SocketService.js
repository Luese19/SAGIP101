import io from 'socket.io-client';
import { Platform } from 'react-native';
import HapticService from './HapticService';

const SOCKET_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:5000'  // Android emulator
  : 'http://localhost:5000'; // iOS simulator and physical devices

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connectionListeners = [];
  }

  connect(userId, displayName) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
      auth: {
        uid: userId,
        displayName: displayName
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      HapticService.success();
      
      // Notify all listeners about connection
      this.connectionListeners.forEach(callback => callback(true));
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
      HapticService.error();
      
      // Notify all listeners about disconnection
      this.connectionListeners.forEach(callback => callback(false, error));
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      this.isConnected = false;
      
      // Notify all listeners about disconnection
      this.connectionListeners.forEach(callback => callback(false, new Error(reason)));
    });

    // Add haptic feedback for game events
    this.setupGameEventListeners();

    return this.socket;
  }

  setupGameEventListeners() {
    if (!this.socket) return;

    this.socket.on('room_created', () => HapticService.success());
    this.socket.on('room_joined', () => HapticService.success());
    this.socket.on('player_joined', () => HapticService.light());
    this.socket.on('player_left', () => HapticService.light());
    this.socket.on('game_started', () => {
      HapticService.warning();
      setTimeout(() => HapticService.success(), 1000);
    });
    this.socket.on('correct_answer', () => HapticService.success());
    this.socket.on('wrong_answer', () => HapticService.error());
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      // Add haptic feedback for user actions
      if (event === 'create_room' || event === 'join_room') {
        HapticService.medium();
      } else if (event === 'player_ready') {
        HapticService.success();
      } else if (event === 'submit_answer') {
        HapticService.light();
      }
      
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
      HapticService.error();
    }
  }

  // Add connection status listener
  addConnectionListener(callback) {
    this.connectionListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionListeners.indexOf(callback);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  // Game room methods
  createRoom(roomData) {
    this.emit('create_room', roomData);
  }

  joinRoom(roomId, playerName) {
    this.emit('join_room', { roomId, playerName });
  }

  getRooms() {
    this.emit('get_rooms');
  }

  setPlayerReady() {
    this.emit('player_ready');
  }

  submitAnswer(answerIndex) {
    this.emit('submit_answer', { answerIndex });
  }

  useSkill(skillType, targetId) {
    this.emit('use_skill', { skillType, targetId });
  }

  leaveRoom() {
    this.emit('leave_room');
  }

  // Connection status
  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();