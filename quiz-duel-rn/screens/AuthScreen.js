import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (!result.success) {
          Alert.alert('Login Failed', result.error);
        }
      } else {
        if (password !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          setLoading(false);
          return;
        }
        
        if (password.length < 6) {
          Alert.alert('Error', 'Password must be at least 6 characters long');
          setLoading(false);
          return;
        }

        const result = await signup(email, password, displayName);
        if (!result.success) {
          Alert.alert('Signup Failed', result.error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.content}>
              <Text style={styles.logo}>🎯</Text>
              <Text style={styles.title}>Quiz Duel</Text>
              <Text style={styles.subtitle}>Brain Battle</Text>
              
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, isLogin && styles.activeTab]}
                  onPress={() => setIsLogin(true)}
                >
                  <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, !isLogin && styles.activeTab]}
                  onPress={() => setIsLogin(false)}
                >
                  <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
                {!isLogin && (
                  <TextInput
                    style={styles.input}
                    placeholder="Display Name"
                    placeholderTextColor="#999"
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                  />
                )}
                
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                
                {!isLogin && (
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                )}
                
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleAuth}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 4,
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 21,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#667eea',
  },
  form: {
    width: '100%',
    maxWidth: 350,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AuthScreen;