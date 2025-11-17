import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateAuthProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up function
  const signup = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateAuthProfile(user, { displayName });

      // Create user profile in Firestore
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        bio: '',
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          totalSkillPoints: 0,
          highestStreak: 0,
          totalPlayTime: 0
        },
        achievements: [],
        preferences: {
          theme: 'default',
          soundEffects: true,
          notifications: true
        }
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      setUserProfile(userProfile);
      
      return { success: true, user };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  // Sign in function
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Sign out function
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // Load user profile from Firestore
  const loadUserProfile = async (user) => {
    try {
      console.log('Loading user profile for:', user.uid);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        console.log('Profile loaded:', profileData);
        setUserProfile(profileData);
        return profileData;
      } else {
        console.log('User profile does not exist, creating...');
        // Create profile if it doesn't exist
        const defaultProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          bio: '',
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          stats: {
            gamesPlayed: 0,
            gamesWon: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            totalSkillPoints: 0,
            highestStreak: 0,
            totalPlayTime: 0
          },
          achievements: [],
          preferences: {
            theme: 'default',
            soundEffects: true,
            notifications: true
          }
        };
        await setDoc(doc(db, 'users', user.uid), defaultProfile);
        setUserProfile(defaultProfile);
        return defaultProfile;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  // Update user profile (display name, avatar, etc.)
  const updateUserProfile = async (profileData) => {
    if (!currentUser) return { success: false, error: 'No user logged in' };

    try {
      console.log('Updating profile for user:', currentUser.uid);
      console.log('Profile data received:', profileData);

      // Update only Firebase Auth profile for display name (don't set photoURL due to length limits)
      const authUpdateData = {};
      if (profileData.displayName && profileData.displayName !== currentUser.displayName) {
        authUpdateData.displayName = profileData.displayName;
      }
      // Note: We don't set photoURL in Auth profile due to Firebase Auth URL length limitations
      // Instead, we store the image data in Firestore only

      if (Object.keys(authUpdateData).length > 0) {
        console.log('Updating auth profile with:', authUpdateData);
        await updateAuthProfile(currentUser, authUpdateData);
        console.log('Auth profile updated successfully');
      }

      // Then update Firestore profile with all data
      const updateData = {
        displayName: profileData.displayName,
        bio: profileData.bio || '',
        photoURL: profileData.photoURL,
        avatarColor: profileData.avatarColor,
        updatedAt: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      console.log('Firestore update data:', updateData);

      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // First check if document exists
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        console.log('User document does not exist, creating new one');
        await setDoc(userDocRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          ...updateData,
          stats: {
            gamesPlayed: 0,
            gamesWon: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            totalSkillPoints: 0,
            highestStreak: 0,
            totalPlayTime: 0
          },
          achievements: [],
          preferences: {
            theme: 'default',
            soundEffects: true,
            notifications: true
          }
        });
      } else {
        console.log('User document exists, updating...');
        await updateDoc(userDocRef, updateData);
      }
      
      console.log('Firestore profile updated successfully');

      // Reload user profile
      await loadUserProfile(currentUser);
      console.log('Profile reload completed');

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to update profile';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. This might be due to Firestore security rules. Please contact support.';
        console.error('Firestore permission denied. This usually means security rules are too restrictive.');
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service temporarily unavailable. Please try again.';
      } else if (error.code === 'not-found') {
        errorMessage = 'User profile not found. Please try logging out and back in.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Update user statistics
  const updateUserStats = async (statsUpdate) => {
    if (!currentUser || !userProfile) return;

    try {
      const newStats = {
        ...userProfile.stats,
        ...statsUpdate
      };

      await updateDoc(doc(db, 'users', currentUser.uid), {
        stats: newStats,
        lastPlayed: new Date().toISOString()
      });

      setUserProfile(prev => ({
        ...prev,
        stats: newStats
      }));

      return { success: true };
    } catch (error) {
      console.error('Error updating user stats:', error);
      return { success: false, error: error.message };
    }
  };

  // Check and unlock achievements
  const checkAchievements = async () => {
    if (!currentUser || !userProfile) return;

    const stats = userProfile.stats;
    const newAchievements = [];

    // Define achievement criteria
    const achievements = [
      { id: 'first_game', name: 'First Steps', description: 'Play your first game', condition: stats.gamesPlayed >= 1 },
      { id: 'first_win', name: 'First Victory', description: 'Win your first game', condition: stats.gamesWon >= 1 },
      { id: 'quiz_master', name: 'Quiz Master', description: 'Answer 100 questions correctly', condition: stats.correctAnswers >= 100 },
      { id: 'dedicated_player', name: 'Dedicated Player', description: 'Play 10 games', condition: stats.gamesPlayed >= 10 },
      { id: 'high_scorer', name: 'High Scorer', description: 'Earn 500 total skill points', condition: stats.totalSkillPoints >= 500 },
      { id: 'streak_master', name: 'Streak Master', description: 'Get a 10-question streak', condition: stats.highestStreak >= 10 },
      { id: 'warrior', name: 'Quiz Warrior', description: 'Play 25 games', condition: stats.gamesPlayed >= 25 },
      { id: 'champion', name: 'Quiz Champion', description: 'Win 10 games', condition: stats.gamesWon >= 10 }
    ];

    achievements.forEach(achievement => {
      if (achievement.condition && !userProfile.achievements.find(a => a.id === achievement.id)) {
        newAchievements.push({
          ...achievement,
          unlockedAt: new Date().toISOString()
        });
      }
    });

    if (newAchievements.length > 0) {
      const updatedAchievements = [...userProfile.achievements, ...newAchievements];
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        achievements: updatedAchievements
      });

      setUserProfile(prev => ({
        ...prev,
        achievements: updatedAchievements
      }));

      return newAchievements;
    }

    return [];
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      setCurrentUser(user);
      
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    updateProfile: updateUserProfile,
    updateUserStats,
    checkAchievements,
    loadUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};