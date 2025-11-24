import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import SocketService from '../services/SocketService';

const { width, height } = Dimensions.get('window');

const GameScreen = ({ navigation, route }) => {
  const { currentUser, updateUserStats } = useAuth();
  const [gameState, setGameState] = useState('waiting'); // waiting, question, results, finished
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [players, setPlayers] = useState([]);
  const [gameResults, setGameResults] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [timerAnimation] = useState(new Animated.Value(1));
  const [connectionError, setConnectionError] = useState('');

  const roomId = route.params?.roomId || '';
  const gameData = route.params?.gameData || {};

  useEffect(() => {
    if (!roomId) {
      navigation.goBack();
      return;
    }

    // Socket listeners for game events
    SocketService.on('question', (data) => {
      setCurrentQuestion(data.question);
      setTimeLeft(data.timeLimit || 5);
      setGameState('question');
      setSelectedAnswer(null);
      setShowResults(false);
    });

    SocketService.on('answer_result', (data) => {
      setShowResults(true);
      if (data.correct) {
        setScore(prev => prev + data.points);
      }
      // Show results for 3 seconds then move to next question
      setTimeout(() => {
        if (data.isLastQuestion) {
          setGameState('finished');
        } else {
          setGameState('question');
        }
      }, 3000);
    });

    SocketService.on('game_ended', (data) => {
      setGameResults(data);
      setGameState('finished');
      updateUserStats({
        skillPoints: data.score,
        correctAnswers: data.correctAnswers,
        questionsAnswered: data.totalQuestions,
        totalTime: data.totalTime,
        isWinner: data.isWinner,
        category: data.category
      });
    });

    SocketService.on('player_left', (data) => {
      setPlayers(data.players || []);
    });

    SocketService.on('error_message', (data) => {
      setConnectionError(data.message);
    });

    return () => {
      SocketService.off('question');
      SocketService.off('answer_result');
      SocketService.off('game_ended');
      SocketService.off('player_left');
      SocketService.off('error_message');
    };
  }, [roomId, navigation, updateUserStats]);

  useEffect(() => {
    if (gameState === 'question' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (gameState === 'question' && timeLeft === 0) {
      // Time's up - automatically submit no answer
      handleSubmitAnswer(-1);
    }
  }, [gameState, timeLeft]);

  useEffect(() => {
    // Animate timer
    if (gameState === 'question') {
      Animated.timing(timerAnimation, {
        toValue: 0,
        duration: (timeLeft * 1000),
        useNativeDriver: false,
      }).start();
    } else {
      timerAnimation.setValue(1);
    }
  }, [gameState, timeLeft, timerAnimation]);

  const handleSubmitAnswer = (answerIndex) => {
    if (selectedAnswer !== null || showResults) return;
    
    setSelectedAnswer(answerIndex);
    SocketService.submitAnswer(answerIndex);
  };

  const handleLeaveGame = () => {
    Alert.alert(
      'Leave Game',
      'Are you sure you want to leave the game? Your progress will be lost.',
      [
        { text: 'Stay', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: () => {
            SocketService.leaveRoom();
            navigation.navigate('Dashboard');
          }
        }
      ]
    );
  };

  const TimerBar = () => {
    const progress = timerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%']
    });

    return (
      <View style={styles.timerContainer}>
        <View style={styles.timerBar}>
          <Animated.View 
            style={[
              styles.timerProgress,
              { width: progress }
            ]} 
          />
        </View>
        <Text style={styles.timerText}>{timeLeft}s</Text>
      </View>
    );
  };

  const PlayerScoreboard = () => (
    <View style={styles.scoreboard}>
      <Text style={styles.scoreboardTitle}>🏆 Leaderboard</Text>
      <View style={styles.playersList}>
        {players
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 3)
          .map((player, index) => (
            <View key={player.uid} style={styles.leaderboardItem}>
              <Text style={styles.leaderboardPosition}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </Text>
              <Text style={styles.leaderboardName}>
                {player.displayName || 'Player'}
              </Text>
              <Text style={styles.leaderboardScore}>
                {player.score || 0}
              </Text>
            </View>
          ))}
      </View>
    </View>
  );

  const renderWaiting = () => (
    <View style={styles.centeredContent}>
      <Text style={styles.waitingIcon}>🎮</Text>
      <Text style={styles.waitingTitle}>Game Starting</Text>
      <Text style={styles.waitingText}>Get ready for the quiz battle!</Text>
    </View>
  );

  const renderQuestion = () => (
    <View style={styles.questionContainer}>
      <TimerBar />
      
      <View style={styles.questionHeader}>
        <Text style={styles.questionCategory}>
          {currentQuestion?.category || 'General'}
        </Text>
        <Text style={styles.questionNumber}>
          Question {questionIndex + 1}
        </Text>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>
          {currentQuestion?.question || 'Loading question...'}
        </Text>
      </View>

      <View style={styles.answersContainer}>
        {currentQuestion?.options?.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.answerButton,
              selectedAnswer === index && styles.selectedAnswer,
              showResults && index === currentQuestion.correctAnswer && styles.correctAnswer,
              showResults && selectedAnswer === index && index !== currentQuestion.correctAnswer && styles.incorrectAnswer
            ]}
            onPress={() => handleSubmitAnswer(index)}
            disabled={selectedAnswer !== null}
          >
            <Text style={styles.answerText}>
              {String.fromCharCode(65 + index)}. {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <PlayerScoreboard />
    </View>
  );

  const renderResults = () => (
    <View style={styles.centeredContent}>
      <Text style={styles.resultsIcon}>🎉</Text>
      <Text style={styles.resultsTitle}>Question Complete!</Text>
      {selectedAnswer === currentQuestion.correctAnswer ? (
        <Text style={styles.correctText}>✅ Correct!</Text>
      ) : (
        <Text style={styles.incorrectText}>❌ Wrong!</Text>
      )}
      <Text style={styles.nextQuestionText}>Next question coming up...</Text>
    </View>
  );

  const renderFinished = () => (
    <View style={styles.centeredContent}>
      <Text style={styles.finishedIcon}>🏁</Text>
      <Text style={styles.finishedTitle}>Game Finished!</Text>
      
      <View style={styles.finalScore}>
        <Text style={styles.finalScoreText}>Your Score: {score}</Text>
      </View>

      <View style={styles.finalActions}>
        <TouchableOpacity
          style={styles.playAgainButton}
          onPress={() => navigation.navigate('Lobby')}
        >
          <Text style={styles.playAgainText}>Play Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.dashboardText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {connectionError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{connectionError}</Text>
            </View>
          ) : null}

          <View style={styles.header}>
            <Text style={styles.headerTitle}>🎯 Quiz Duel</Text>
            <Text style={styles.headerSubtitle}>Room: {roomId}</Text>
          </View>

          {gameState === 'waiting' && renderWaiting()}
          {gameState === 'question' && renderQuestion()}
          {gameState === 'finished' && renderFinished()}

          <TouchableOpacity
            style={styles.leaveButton}
            onPress={handleLeaveGame}
          >
            <Text style={styles.leaveButtonText}>Leave Game</Text>
          </TouchableOpacity>
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
  errorBanner: {
    backgroundColor: '#ff4757',
    padding: 10,
    margin: 10,
    borderRadius: 8,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  waitingIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  waitingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  waitingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  timerContainer: {
    marginBottom: 20,
  },
  timerBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  timerProgress: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  timerText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  questionCategory: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  questionNumber: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  questionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  answersContainer: {
    marginBottom: 20,
  },
  answerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAnswer: {
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  correctAnswer: {
    borderColor: '#4caf50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  incorrectAnswer: {
    borderColor: '#f44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  answerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  scoreboard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  scoreboardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  playersList: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  leaderboardPosition: {
    fontSize: 16,
    marginRight: 10,
    width: 25,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  leaderboardScore: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  resultsIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  correctText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: 10,
  },
  incorrectText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 10,
  },
  nextQuestionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  finishedIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  finishedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  finalScore: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  finalScoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  finalActions: {
    width: '100%',
    gap: 15,
  },
  playAgainButton: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  playAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dashboardButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dashboardText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  leaveButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default GameScreen;