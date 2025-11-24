import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email.split('@')[0],
              ...userDoc.data()
            });
          } else {
            // Create default profile
            const defaultProfile = {
              displayName: user.displayName || user.email.split('@')[0],
              email: user.email,
              createdAt: new Date().toISOString(),
              stats: {
                gamesPlayed: 0,
                gamesWon: 0,
                totalSkillPoints: 0,
                totalCorrectAnswers: 0,
                totalQuestionsAnswered: 0,
                averageAnswerTime: 0,
                highestWinStreak: 0,
                currentWinStreak: 0,
                favoriteCategory: null,
                achievements: []
              }
            };
            
            await setDoc(doc(db, 'users', user.uid), defaultProfile);
            setUserProfile({ uid: user.uid, ...defaultProfile });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, { displayName });
      
      // Create user document in Firestore
      const userProfile = {
        displayName: displayName || email.split('@')[0],
        email: email,
        createdAt: new Date().toISOString(),
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          totalSkillPoints: 0,
          totalCorrectAnswers: 0,
          totalQuestionsAnswered: 0,
          averageAnswerTime: 0,
          highestWinStreak: 0,
          currentWinStreak: 0,
          favoriteCategory: null,
          achievements: []
        }
      };
      
      await setDoc(doc(db, 'users', result.user.uid), userProfile);
      
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateUserStats = async (gameResults) => {
    if (!currentUser || !userProfile) return;

    try {
      const updatedStats = { ...userProfile.stats };
      
      // Update basic stats
      updatedStats.gamesPlayed += 1;
      updatedStats.totalSkillPoints += gameResults.skillPoints || 0;
      updatedStats.totalCorrectAnswers += gameResults.correctAnswers || 0;
      updatedStats.totalQuestionsAnswered += gameResults.questionsAnswered || 0;
      
      // Update win streak
      if (gameResults.isWinner) {
        updatedStats.gamesWon += 1;
        updatedStats.currentWinStreak += 1;
        updatedStats.highestWinStreak = Math.max(
          updatedStats.highestWinStreak, 
          updatedStats.currentWinStreak
        );
      } else {
        updatedStats.currentWinStreak = 0;
      }
      
      // Calculate average answer time
      if (gameResults.questionsAnswered > 0) {
        const currentTotal = updatedStats.averageAnswerTime * (updatedStats.totalQuestionsAnswered - gameResults.questionsAnswered);
        const newTotal = currentTotal + (gameResults.totalTime || 0);
        updatedStats.averageAnswerTime = Math.round(newTotal / updatedStats.totalQuestionsAnswered);
      }
      
      // Update favorite category
      if (gameResults.category && gameResults.correctAnswers > 0) {
        updatedStats.favoriteCategory = gameResults.category;
      }
      
      // Update user document
      await setDoc(doc(db, 'users', currentUser.uid), {
        ...userProfile,
        stats: updatedStats
      }, { merge: true });
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        stats: updatedStats
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user stats:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    signup,
    logout,
    updateUserStats
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};